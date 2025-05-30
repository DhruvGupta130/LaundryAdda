package com.trulydesignfirm.laundryadda.service.utils;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.trulydesignfirm.laundryadda.model.Orders;
import com.trulydesignfirm.laundryadda.model.embedded.OrderItems;
import com.trulydesignfirm.laundryadda.model.embedded.PricingItem;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

public class BillGenerator {

    public static void generateInvoicePdf(Orders order, String dest, String logoPath) throws IOException {
        PdfWriter writer = new PdfWriter(dest);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);
        List<OrderItems> items = order.getItems();

        // Fonts
        PdfFont font = PdfFontFactory.createFont(StandardFonts.HELVETICA);
        PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);

        // Logo
        ImageData imageData = ImageDataFactory.create(logoPath);
        Image logo = new Image(imageData).scaleToFit(150, 100).setHorizontalAlignment(HorizontalAlignment.LEFT).setMarginBottom(10);
        document.add(logo);

        // Horizontal Divider
        document.add(new LineSeparator(new SolidLine(0.5f)).setStrokeColor(ColorConstants.GRAY).setMarginBottom(10));

        // Invoice Meta
        String invoiceNumber = "INV-" + order.getId().toString().toUpperCase();
        String date = LocalDate.now().toString();

        Table infoTable = new Table(UnitValue.createPercentArray(new float[]{1, 1})).useAllAvailableWidth();
        infoTable.addCell(new Cell().add(new Paragraph("Invoice #: " + invoiceNumber)).setFont(font).setBorder(null));
        infoTable.addCell(new Cell().add(new Paragraph("Date: " + date)).setFont(font).setTextAlignment(TextAlignment.RIGHT).setBorder(null));
        document.add(infoTable);

        // Invoice Title
        document.add(new Paragraph("INVOICE")
                .setFont(boldFont)
                .setFontSize(15)
                .setTextAlignment(TextAlignment.CENTER)
                .setUnderline()
                .setMarginTop(15)
                .setMarginBottom(15));

        // Invoice Table Headers
        float[] colWidths = {40f, 100f, 100f, 100f, 60f, 70f};
        Table table = new Table(colWidths).useAllAvailableWidth().setMarginBottom(15);

        String[] headers = {"Qty", "Service", "Cloth Type", "Cloth", "Price", "Total"};
        for (String h : headers) {
            table.addHeaderCell(new Cell()
                    .add(new Paragraph(h).setFont(boldFont))
                    .setTextAlignment(TextAlignment.CENTER)
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY)
                    .setPadding(5)
                    .setBorderBottom(new SolidBorder(1)));
        }

        for (OrderItems item : items) {
            short qty = item.getQuantity();
            PricingItem p = item.getRequests();
            BigDecimal price = p.getPrice();
            BigDecimal total = BigDecimal.valueOf(qty).multiply(price);

            table.addCell(new Cell().add(new Paragraph(String.valueOf(qty))).setPadding(4));
            table.addCell(new Cell().add(new Paragraph(p.getService().name().replace("_", " "))).setPadding(4));
            table.addCell(new Cell().add(new Paragraph(p.getClothType().name())).setPadding(4));
            table.addCell(new Cell().add(new Paragraph(p.getCloth())).setPadding(4));
            table.addCell(new Cell().add(new Paragraph("₹ " + price.setScale(2, RoundingMode.HALF_UP).toPlainString()).setTextAlignment(TextAlignment.RIGHT)).setPadding(4));
            table.addCell(new Cell().add(new Paragraph("₹ " + total.setScale(2, RoundingMode.HALF_UP).toPlainString()).setTextAlignment(TextAlignment.RIGHT)).setPadding(4));
        }

        document.add(table);

        // Total
        document.add(new Paragraph("Grand Total: ₹ %.2f".formatted(order.getTotalAmount()))
                .setFont(boldFont)
                .setFontSize(12)
                .setTextAlignment(TextAlignment.RIGHT)
                .setMarginTop(5));

        // Footer Section
        document.add(new Paragraph("\n\nAuthorized Signature")
                .setFont(font)
                .setFontSize(11)
                .setTextAlignment(TextAlignment.RIGHT));
        document.add(new Paragraph("__________________________")
                .setFont(font)
                .setFontSize(11)
                .setTextAlignment(TextAlignment.RIGHT));

        document.add(new Paragraph("\nThank you for trusting Laundry Adda – Your Clothing, Our Responsibility.")
                .setTextAlignment(TextAlignment.CENTER)
                .setFont(font)
                .setFontSize(10)
                .setMarginTop(30));

        document.close();
    }
}