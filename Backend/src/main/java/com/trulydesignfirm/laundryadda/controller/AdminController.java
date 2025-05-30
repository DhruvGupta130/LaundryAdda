package com.trulydesignfirm.laundryadda.controller;

import com.trulydesignfirm.laundryadda.actions.Response;
import com.trulydesignfirm.laundryadda.model.Area;
import com.trulydesignfirm.laundryadda.model.Delivery;
import com.trulydesignfirm.laundryadda.service.AdminService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@AllArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/areas")
    public ResponseEntity<Response> addAreas(@RequestParam String city, @RequestBody List<Area> areas) {
        Response response = adminService.addAreas(city, areas);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/deliveries")
    public ResponseEntity<List<Delivery>> getAllDeliveries() {
        return ResponseEntity.ok(adminService.getAllDeliveries());
    }

    @PutMapping("delivery/{deliveryId}/{areaId}")
    public ResponseEntity<Response> provideArea(@PathVariable long areaId, @PathVariable UUID deliveryId) {
        Response response = adminService.provideArea(areaId, deliveryId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
