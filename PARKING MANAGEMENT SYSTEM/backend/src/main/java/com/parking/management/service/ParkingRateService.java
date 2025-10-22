package com.parking.management.service;

import com.parking.management.model.ParkingRate;
import com.parking.management.repository.ParkingRateRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParkingRateService {

    private final ParkingRateRepository parkingRateRepository;

    public ParkingRateService(ParkingRateRepository parkingRateRepository) {
        this.parkingRateRepository = parkingRateRepository;
    }

    public List<ParkingRate> getAllRates() {
        return parkingRateRepository.findAll();
    }
}