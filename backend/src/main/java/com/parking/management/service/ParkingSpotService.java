package com.parking.management.service;

import com.parking.management.model.ParkingSpot;
import com.parking.management.repository.ParkingSpotRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParkingSpotService {

    private final ParkingSpotRepository parkingSpotRepository;

    public ParkingSpotService(ParkingSpotRepository parkingSpotRepository) {
        this.parkingSpotRepository = parkingSpotRepository;
    }

    public List<ParkingSpot> getAvailableSpots() {
        return parkingSpotRepository.findByIsAvailable(true);
    }

    public List<ParkingSpot> getAllSpots() {
        return parkingSpotRepository.findAll();
    }
}