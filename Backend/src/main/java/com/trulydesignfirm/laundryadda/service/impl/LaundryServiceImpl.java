package com.trulydesignfirm.laundryadda.service.impl;

import com.trulydesignfirm.laundryadda.actions.LaundryRequest;
import com.trulydesignfirm.laundryadda.actions.OrdersDTO;
import com.trulydesignfirm.laundryadda.actions.Response;
import com.trulydesignfirm.laundryadda.enums.*;
import com.trulydesignfirm.laundryadda.model.*;
import com.trulydesignfirm.laundryadda.model.embedded.DeliveryAndPickup;
import com.trulydesignfirm.laundryadda.model.embedded.KycDetails;
import com.trulydesignfirm.laundryadda.model.embedded.OrderItems;
import com.trulydesignfirm.laundryadda.model.embedded.PricingItem;
import com.trulydesignfirm.laundryadda.repository.*;
import com.trulydesignfirm.laundryadda.service.FileService;
import com.trulydesignfirm.laundryadda.service.LaundryService;
import com.trulydesignfirm.laundryadda.service.utils.BillGenerator;
import com.trulydesignfirm.laundryadda.service.utils.Utility;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class LaundryServiceImpl implements LaundryService {

    private final LaundryShopRepo laundryShopRepo;
    private final Utility utility;
    private final OrderRepo orderRepo;
    private final FileService fileService;
    private final InvoiceRepo invoiceRepo;
    private final RatingRepo ratingRepo;
    private final ReviewRepo reviewRepo;

    @Value("${laundry.logo.path}")
    private String logo_path;

    @Value("${backend_url}")
    private String baseUrl;

    @Override
    public List<LaundryShop> getAllShops(double latitude, double longitude, double radius, String category) {
        return laundryShopRepo.findShopsWithinRadiusAndService(latitude, longitude, radius);
    }

    @Override
    public List<LaundryShop> getAllShops() {
        return laundryShopRepo.findAll();
    }

    @Override
    public LaundryShop getShopById(UUID id) {
        return getLaundryShop(id);
    }

    @Override
    public LaundryShop getLaundryShopProfile(String token) {
        return getLaundryShop(token);
    }

    @Override
    public Response createLaundry(String token, LaundryRequest request) {
        LoginUser user = utility.getUserFromToken(token);
        if(user.getRole() != Role.LAUNDRY) {
            throw new IllegalArgumentException("You are not authorized to create laundry shops.");
        }
        LaundryShop shop = laundryShopRepo
                .findByOwner(utility.getUserFromToken(token))
                .orElse(new LaundryShop());
        shop.setOwner(user);
        shop.setName(request.getName());
        shop.setDescription(request.getDescription());
        shop.setLogo(request.getLogo());
        shop.setCoverPhoto(request.getCoverPhoto());
        shop.setImages(request.getImages());
        shop.setMobile(request.getMobile());
        shop.setEmail(request.getEmail());
        shop.setAddress(request.getAddress());
        shop.setManagerName(request.getManagerName());
        laundryShopRepo.save(shop);
        return Response.builder()
                .status(HttpStatus.CREATED)
                .message("Laundry shop created successfully.")
                .build();
    }

    @Override
    public KycDetails getKycDocuments(String token) {
        return getLaundryShop(token).getDetails();
    }

    @Override
    public Response updateKycDocuments(String token, KycDetails documents) {
        LaundryShop shop = laundryShopRepo
                .findByOwner(utility.getUserFromToken(token))
                .orElseThrow(() -> new RuntimeException("No laundry shop found."));
        shop.setDetails(documents);
        laundryShopRepo.save(shop);
        return Response.builder()
                .status(HttpStatus.CREATED)
                .message("KYC documents updated successfully.")
                .build();
    }

    @Override
    public List<PricingItem> getPricing(String token) {
        return getLaundryShop(token).getPrices();
    }

    @Override
    public List<PricingItem> getPricing(UUID shopId) {
        return getLaundryShop(shopId).getPrices();
    }

    @Override
    public Response updatePricing(String token, List<PricingItem> items) {
        LaundryShop shop = laundryShopRepo
                .findByOwner(utility.getUserFromToken(token))
                .orElseThrow(() -> new RuntimeException("No laundry shop found."));
        shop.setPrices(items);
        laundryShopRepo.save(shop);
        return Response.builder()
                .status(HttpStatus.CREATED)
                .message("Pricing updated successfully.")
                .build();
    }

    @Override
    public Response uploadPricing(String token, MultipartFile file) {
        Set<String> uniqueKeys = new HashSet<>();
        List<PricingItem> items = new ArrayList<>();

        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);

            List<String> expectedHeaders = List.of("service", "clothtype", "cloth", "price");

            for (int i = 0; i < expectedHeaders.size(); i++) {
                Cell cell = headerRow.getCell(i);
                String actual = cell != null ? cell.getStringCellValue().trim().toLowerCase() : "";
                if (!expectedHeaders.get(i).equals(actual)) {
                    throw new RuntimeException("Invalid header at column " + (i + 1) +
                            ". Expected: " + expectedHeaders.get(i) + ", Found: " + actual);
                }
            }

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                try {
                    String serviceStr = row.getCell(0).getStringCellValue().trim().toUpperCase();
                    String clothTypeStr = row.getCell(1).getStringCellValue().trim().toUpperCase();
                    String cloth = row.getCell(2).getStringCellValue().trim().toUpperCase();
                    BigDecimal price = BigDecimal.valueOf(row.getCell(3).getNumericCellValue());
                    String key = serviceStr + "|" + clothTypeStr + "|" + cloth;
                    if (uniqueKeys.contains(key)) continue;
                    uniqueKeys.add(key);

                    PricingItem item = new PricingItem();
                    item.setService(Services.valueOf(serviceStr));
                    item.setClothType(ClothType.valueOf(clothTypeStr));
                    item.setCloth(cloth);
                    item.setPrice(price);

                    items.add(item);
                } catch (Exception e) {
                    throw new RuntimeException("Invalid data at row " + (i + 1) + ": " + e.getMessage());
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to read uploaded file", e);
        }
        return updatePricing(token, items);
    }

    @Override
    public Response updateDeliveryPickup(String token, DeliveryAndPickup pickup) {
        LaundryShop shop = getLaundryShop(token);
        if (pickup.getPickupSlots() == null || pickup.getPickupSlots().isEmpty())
            throw new IllegalArgumentException("Invalid Request.");
        pickup.setExpress(pickup.getExpress() != null && pickup.getExpress());
        pickup.setSemiExpress(pickup.getSemiExpress() != null && pickup.getSemiExpress());
        shop.setDeliveryAndPickup(pickup);
        laundryShopRepo.save(shop);
        return Response.builder()
                .status(HttpStatus.CREATED)
                .message("Delivery and Pickup updated successfully.")
                .build();
    }

    @Override
    public Integer checkLaundryShop(String token) {
        LaundryShop shop = laundryShopRepo.findByOwner(utility.getUserFromToken(token)).orElse(null);
        if (shop == null) return 1;
        if (shop.getDetails() == null) return 2;
        if (shop.getPrices() == null || shop.getPrices().isEmpty()) return 3;
        DeliveryAndPickup dp = shop.getDeliveryAndPickup();
        if (dp == null
                || dp.getSemiExpress() == null
                || dp.getExpress() == null
                || dp.getPickupSlots() == null
                || dp.getPickupSlots().isEmpty()) return 4;
        return 0;
    }

    @Override
    public Page<OrdersDTO> getAllOrders(String token, int pageNumber, int size, OrderStatus status, String query) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(pageNumber, size, sort);
        LaundryShop shop = getLaundryShop(token);
        return orderRepo.findAllByShopAndStatus(shop, status, pageable, query)
                .map(OrdersDTO::new);
    }

    @Override
    public List<OrdersDTO> getNewOrders(String token) {
        return orderRepo.findAllByShopAndStatus(getLaundryShop(token), OrderStatus.PENDING_OWNER_CONFIRMATION)
                .stream().map(OrdersDTO::new).toList();
    }

    @Override
    public Response acceptOrder(String token, UUID orderId) {
        LaundryShop shop = getLaundryShop(token);
        Orders order = orderRepo.findByIdAndShop(orderId, shop).orElseThrow(() -> new RuntimeException("Order not found."));
        if (order.getStatus() != OrderStatus.PENDING_OWNER_CONFIRMATION) {
            throw new IllegalArgumentException("Invalid Request.");
        }
        order.setSecretCode(ThreadLocalRandom.current().nextInt(100000, 1000000));
        order.setStatus(OrderStatus.AWAITING_PICKUP);
        orderRepo.save(order);
        return Response.builder()
                .status(HttpStatus.OK)
                .message("Order accepted successfully.")
                .build();
    }

    @Override
    @Transactional
    public Response generateBill(String token, UUID orderId, List<OrderItems> items, String notes) throws IOException {
        LaundryShop shop = getLaundryShop(token);
        Orders order = orderRepo.findByIdAndShop(orderId, shop).orElseThrow(() -> new RuntimeException("Order not found."));
        if (order.getStatus() != OrderStatus.COUNTING) throw new IllegalArgumentException("Invalid Request.");
        if (notes != null && !notes.isBlank()) order.setNotes(notes);
        BigDecimal multiplier = switch (order.getOrderType()) {
            case EXPRESS -> BigDecimal.TWO;
            case SEMI_EXPRESS -> BigDecimal.valueOf(1.5);
            default -> BigDecimal.ONE;
        };
        items.forEach(item -> item.getRequests().setPrice(item.getRequests().getPrice().multiply(multiplier)));
        order.setItems(items);
        order.setStatus(OrderStatus.BILL_GENERATED);
        order.calculateTotalAmount();
        orderRepo.save(order);
        StoredFile pdfFileRecord = generateAndUploadInvoicePdf(order, logo_path);
        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber("INV-" + order.getId().toString().substring(0, 8).toUpperCase());
        invoice.setTotalAmount(order.getTotalAmount());
        invoice.setPdfUrl(baseUrl + "/api/files/invoice/" + order.getId());
        invoice.setFilePath(pdfFileRecord.getFilePath());
        invoice.setOrder(order);
        invoiceRepo.save(invoice);
        return Response.builder()
                .status(HttpStatus.OK)
                .message("Bill generated successfully.")
                .build();
    }

    @Override
    public Response startOrderProcessing(String token, UUID orderId) {
        LaundryShop shop = getLaundryShop(token);
        Orders order = orderRepo.findByIdAndShop(orderId, shop).orElseThrow(() -> new RuntimeException("Order not found."));
        if (order.getStatus() != OrderStatus.BILL_GENERATED) {
            throw new IllegalArgumentException("Invalid Request.");
        }
        order.setStatus(OrderStatus.PROCESSING);
        orderRepo.save(order);
        return Response.builder()
                .status(HttpStatus.OK)
                .message("Order processing started successfully.")
                .build();
    }

    @Override
    public Response readyForDelivery(String token, UUID orderId) {
        LaundryShop shop = getLaundryShop(token);
        Orders order = orderRepo.findByIdAndShop(orderId, shop).orElseThrow(() -> new RuntimeException("Order not found."));
        if (order.getStatus() != OrderStatus.PROCESSING) {
            throw new IllegalArgumentException("Invalid Request.");
        }
        order.setSecretCode(ThreadLocalRandom.current().nextInt(100000, 1000000));
        order.setStatus(OrderStatus.READY_FOR_DELIVERY);
        orderRepo.save(order);
        return Response.builder()
                .status(HttpStatus.OK)
                .message("Order is now ready for delivery.")
                .build();
    }

    @Override
    public Response cancelOrder(String token, UUID orderId) {
        LaundryShop shop = getLaundryShop(token);
        Orders order = orderRepo.findByIdAndShop(orderId, shop).orElseThrow(() -> new RuntimeException("Order not found."));
        if (!(order.getStatus() == OrderStatus.PENDING_OWNER_CONFIRMATION ||
                order.getStatus() == OrderStatus.AWAITING_PICKUP)) {
            throw new IllegalArgumentException("This order cannot be cancelled.");
        }
        order.setStatus(OrderStatus.CANCELLED_BY_OWNER);
        orderRepo.save(order);
        return Response.builder()
                .status(HttpStatus.OK)
                .message("Order status updated successfully.")
                .build();
    }

    @Override
    public Map<String, ?> getDashboardDetails(String token, String period) {
        LaundryShop shop = getLaundryShop(token);
        LocalDateTime endDateTime = LocalDateTime.now();

        LocalDateTime startDateTime = switch (period.toLowerCase()) {
            case "week"  -> endDateTime.with(DayOfWeek.MONDAY).toLocalDate().atStartOfDay();
            case "month" -> endDateTime.withDayOfMonth(1).toLocalDate().atStartOfDay();
            case "year"  -> endDateTime.withDayOfYear(1).toLocalDate().atStartOfDay();
            case "overall" -> null;  // no date filter
            default -> null;         // fallback if the period is invalid
        };

        long totalOrders;
        long numberOfVisitors;
        Double totalRevenue;

        if (startDateTime != null) {
            totalOrders = orderRepo.countByShopAndCreatedAtBetween(shop, startDateTime, endDateTime);
            numberOfVisitors = orderRepo.countDistinctCustomerByShopAndCreatedAtBetween(shop, startDateTime, endDateTime);
            totalRevenue = orderRepo.sumTotalAmountByShopAndCreatedAtBetween(shop, startDateTime, endDateTime);
        } else {
            totalOrders = orderRepo.countByShop(shop);
            numberOfVisitors = orderRepo.countDistinctCustomerByShop(shop);
            totalRevenue = orderRepo.sumTotalAmountByShop(shop);
        }

        totalRevenue = totalRevenue != null ? totalRevenue : 0.0;

        double totalProfit = totalRevenue * 0.8;
        double commissionPaid = totalRevenue * 0.2;

        return Map.of(
                "numberOfVisitors", numberOfVisitors,
                "totalOrders", totalOrders,
                "totalRevenue", totalRevenue,
                "totalProfit", totalProfit,
                "commissionPaid", commissionPaid
        );
    }

    @Override
    public void updateShopRating(Orders order, Review review) {
        LaundryShop shop = order.getShop();
        Rating rating = Optional.ofNullable(shop.getRating()).orElse(new Rating());
        int count = rating.getReviewCount() + 1;
        rating.setService((rating.getService() * rating.getReviewCount() + review.getService()) / count);
        rating.setTime((rating.getTime() * rating.getReviewCount() + review.getTime()) / count);
        rating.setClothing((rating.getClothing() * rating.getReviewCount() + review.getClothing()) / count);
        rating.setValue((rating.getValue() * rating.getReviewCount() + review.getValue()) / count);
        double newOverall = (rating.getService() + rating.getTime() + rating.getClothing() + rating.getValue()) / 4.0;
        rating.setOverall(newOverall);
        rating.setReviewCount(count);
        rating.setShop(shop);
        ratingRepo.save(rating);
    }

    @Override
    public Rating getShopRatings(UUID shopId) {
        return getLaundryShop(shopId).getRating();
    }

    @Override
    public List<Review> getShopReviews(UUID shopId) {
        Sort createdAt = Sort.by(Sort.Direction.DESC, "createdAt");
        return reviewRepo.getReviewByShop(getLaundryShop(shopId), createdAt);
    }

    private LaundryShop getLaundryShop(String token) {
        return laundryShopRepo
                .findByOwner(utility.getUserFromToken(token))
                .orElseThrow(() -> new RuntimeException("No laundry shop found."));
    }

    private LaundryShop getLaundryShop(UUID shopId) {
        return laundryShopRepo.findById(shopId)
                .orElseThrow(() -> new RuntimeException("No laundry shop found."));
    }

    private StoredFile generateAndUploadInvoicePdf(Orders order, String logoPath) throws IOException {
        String pdfFileName = "invoice-" + order.getId() + ".pdf";
        Path pdfPath = Paths.get("invoice", pdfFileName);
        Files.createDirectories(pdfPath.getParent());
        BillGenerator.generateInvoicePdf(order, pdfPath.toString(), logoPath);
        StoredFile storedFile = fileService.uploadFile(pdfPath);
        Files.deleteIfExists(pdfPath);
        return storedFile;
    }

}
