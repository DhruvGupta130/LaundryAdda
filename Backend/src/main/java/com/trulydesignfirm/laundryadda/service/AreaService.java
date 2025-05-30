package com.trulydesignfirm.laundryadda.service;

import com.trulydesignfirm.laundryadda.model.Area;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

@Service
public interface AreaService {
    Page<Area> findByCity(String city, int pageNumber, int size);
}
