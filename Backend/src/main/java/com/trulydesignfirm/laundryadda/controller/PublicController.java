package com.trulydesignfirm.laundryadda.controller;

import com.trulydesignfirm.laundryadda.enums.TimeSlots;
import com.trulydesignfirm.laundryadda.model.Area;
import com.trulydesignfirm.laundryadda.model.LaundryShop;
import com.trulydesignfirm.laundryadda.model.Rating;
import com.trulydesignfirm.laundryadda.model.Review;
import com.trulydesignfirm.laundryadda.model.embedded.PricingItem;
import com.trulydesignfirm.laundryadda.service.AreaService;
import com.trulydesignfirm.laundryadda.service.LaundryService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@AllArgsConstructor
@RequestMapping("/api/public")
public class PublicController {

    private final LaundryService laundryService;
    private final AreaService areaService;

    @GetMapping("/timeslots")
    public ResponseEntity<TimeSlots[]> getTimeSlots() {
        return ResponseEntity.ok(TimeSlots.values());
    }

    @GetMapping("/shops")
    public List<LaundryShop> getShops(@RequestParam double latitude,
                                      @RequestParam double longitude,
                                      @RequestParam double radius,
                                      @RequestParam(required = false) String category) {
        return laundryService.getAllShops(latitude, longitude, radius, category);
    }

    @GetMapping("/all")
    public ResponseEntity<List<LaundryShop>> getAllShops() {
        return ResponseEntity.ok(laundryService.getAllShops());
    }

    @GetMapping("/areas")
    public ResponseEntity<Page<Area>> getAreas(@RequestParam String city, @RequestParam int pageNumber, @RequestParam int size) {
        return ResponseEntity.ok(areaService.findByCity(city, pageNumber, size));
    }

    @GetMapping("/laundry/pricing/{shopId}")
    public ResponseEntity<List<PricingItem>> getLaundryPricing(@PathVariable UUID shopId) {
        return ResponseEntity.ok(laundryService.getPricing(shopId));
    }

    @GetMapping("/shop/rating/{shopId}")
    public ResponseEntity<Rating> getShopRating(@PathVariable UUID shopId) {
        return ResponseEntity.ok(laundryService.getShopRatings(shopId));
    }

    @GetMapping("/shop/reviews/{shopId}")
    public ResponseEntity<List<Review>> getShopReviews(@PathVariable UUID shopId) {
        return ResponseEntity.ok(laundryService.getShopReviews(shopId));
    }

}
