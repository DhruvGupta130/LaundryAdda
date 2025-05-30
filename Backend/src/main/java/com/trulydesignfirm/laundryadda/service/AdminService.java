package com.trulydesignfirm.laundryadda.service;

import com.trulydesignfirm.laundryadda.actions.Response;
import com.trulydesignfirm.laundryadda.model.Area;
import com.trulydesignfirm.laundryadda.model.Delivery;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public interface AdminService {

    Response addAreas(String CityName, List<Area> areas);
    Response provideArea(long area, UUID deliveryId);
    List<Delivery> getAllDeliveries();
}
