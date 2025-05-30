package com.trulydesignfirm.laundryadda.service.impl;

import com.trulydesignfirm.laundryadda.model.Area;
import com.trulydesignfirm.laundryadda.repository.AreaRepo;
import com.trulydesignfirm.laundryadda.service.AreaService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AreaServiceImpl implements AreaService {

    private final AreaRepo areaRepo;

    @Override
    public Page<Area> findByCity(String city, int pageNumber, int size) {
        Pageable pageable = PageRequest.of(pageNumber, size);
        return areaRepo.findByCityName(city, pageable);
    }
}
