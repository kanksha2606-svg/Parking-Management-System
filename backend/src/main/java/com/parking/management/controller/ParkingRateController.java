package com.parking.management.controller;

import com.parking.management.model.ParkingRate;
import com.parking.management.service.ParkingRateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rates")
@CrossOrigin(origins = "http://localhost:3000")
public class ParkingRateController {

    private final ParkingRateService parkingRateService;

    public ParkingRateController(ParkingRateService parkingRateService) {
        this.parkingRateService = parkingRateService;
    }

    @GetMapping
    public ResponseEntity<List<ParkingRate>> getAllRates() {
        return ResponseEntity.ok(parkingRateService.getAllRates());
    }
}