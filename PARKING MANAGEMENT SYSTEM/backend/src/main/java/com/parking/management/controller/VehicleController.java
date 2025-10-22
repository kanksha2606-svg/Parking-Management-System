package com.parking.management.controller;

import com.parking.management.dto.VehicleEntryRequest;
import com.parking.management.model.Vehicle;
import com.parking.management.service.VehicleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "*")  // ADD THIS LINE
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @PostMapping("/checkin")
    public ResponseEntity<?> checkIn(@RequestBody VehicleEntryRequest request) {
        try {
            Vehicle vehicle = vehicleService.checkIn(request);
            return ResponseEntity.ok(vehicle);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/checkout/{licensePlate}")
    public ResponseEntity<?> checkOut(@PathVariable String licensePlate) {
        try {
            Vehicle vehicle = vehicleService.checkOut(licensePlate);
            return ResponseEntity.ok(vehicle);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/find/{licensePlate}")
    public ResponseEntity<?> findVehicle(@PathVariable String licensePlate) {
        try {
            return ResponseEntity.ok(vehicleService.findVehicle(licensePlate));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/parked")
    public ResponseEntity<List<Vehicle>> getAllParkedVehicles() {
        return ResponseEntity.ok(vehicleService.getAllParkedVehicles());
    }
}