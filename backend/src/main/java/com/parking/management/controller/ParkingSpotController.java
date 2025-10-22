package com.parking.management.controller;

import com.parking.management.model.ParkingSpot;
import com.parking.management.service.ParkingSpotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parking-spots")
@CrossOrigin(origins = "*")  // ADD THIS LINE
public class ParkingSpotController {

    private final ParkingSpotService parkingSpotService;

    public ParkingSpotController(ParkingSpotService parkingSpotService) {
        this.parkingSpotService = parkingSpotService;
    }

    @GetMapping("/available")
    public ResponseEntity<List<ParkingSpot>> getAvailableSpots() {
        return ResponseEntity.ok(parkingSpotService.getAvailableSpots());
    }

    @GetMapping
    public ResponseEntity<List<ParkingSpot>> getAllSpots() {
        return ResponseEntity.ok(parkingSpotService.getAllSpots());
    }
}