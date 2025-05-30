package com.trulydesignfirm.laundryadda.service.impl;

import com.trulydesignfirm.laundryadda.actions.Response;
import com.trulydesignfirm.laundryadda.model.Area;
import com.trulydesignfirm.laundryadda.model.City;
import com.trulydesignfirm.laundryadda.model.Delivery;
import com.trulydesignfirm.laundryadda.repository.AreaRepo;
import com.trulydesignfirm.laundryadda.repository.CityRepo;
import com.trulydesignfirm.laundryadda.repository.DeliveryRepo;
import com.trulydesignfirm.laundryadda.service.AdminService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final CityRepo cityRepo;
    private final DeliveryRepo deliveryRepo;
    private final AreaRepo areaRepo;

    @Override
    public Response addAreas(String cityName, List<Area> areas) {
        City city = cityRepo.findByName(cityName).orElse(new City());
        city.setName(cityName);
        city.setAreas(areas);
        areas.forEach(area -> area.setCity(city));
        cityRepo.save(city);
        return Response.builder()
                .message("Areas added successfully.")
                .status(HttpStatus.CREATED)
                .build();
    }

    @Override
    public Response provideArea(long areaId, UUID deliveryId) {
        Delivery delivery = deliveryRepo.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery profile not found."));
        Area area = areaRepo.findById(areaId)
                .orElseThrow(() -> new RuntimeException("Area not found."));
        if (delivery.getAreas().contains(area))
            throw new IllegalArgumentException("Area already provided.");
        delivery.getAreas().add(area);
        deliveryRepo.save(delivery);
        return Response.builder()
                .message("Area provided successfully.")
                .status(HttpStatus.CREATED)
                .build();
    }

    @Override
    public List<Delivery> getAllDeliveries() {
        return deliveryRepo.findAll();
    }
}
