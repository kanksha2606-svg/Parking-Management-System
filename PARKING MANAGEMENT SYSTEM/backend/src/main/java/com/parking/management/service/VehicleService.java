package com.parking.management.service;

import com.parking.management.dto.VehicleEntryRequest;
import com.parking.management.model.ParkingSpot;
import com.parking.management.model.Vehicle;
import com.parking.management.repository.ParkingSpotRepository;
import com.parking.management.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final ParkingSpotRepository parkingSpotRepository;

    public VehicleService(VehicleRepository vehicleRepository, ParkingSpotRepository parkingSpotRepository) {
        this.vehicleRepository = vehicleRepository;
        this.parkingSpotRepository = parkingSpotRepository;
    }

    @Transactional
    public Vehicle checkIn(VehicleEntryRequest request) {
        // Check if vehicle already exists
        Vehicle existingVehicle = vehicleRepository.findByLicensePlate(request.getLicensePlate()).orElse(null);

        // If vehicle exists and is currently parked, throw error
        if (existingVehicle != null && "PARKED".equals(existingVehicle.getStatus())) {
            throw new RuntimeException("Vehicle is already checked in");
        }

        // Find parking spot
        ParkingSpot spot = parkingSpotRepository.findBySpotNumber(request.getSpotNumber())
                .orElseThrow(() -> new RuntimeException("Parking spot not found"));

        if (!spot.getIsAvailable()) {
            throw new RuntimeException("Parking spot is not available");
        }

        Vehicle vehicle;

        // If vehicle exists but was checked out, reuse the record
        if (existingVehicle != null) {
            vehicle = existingVehicle;
            vehicle.setStatus("PARKED");
            vehicle.setEntryTime(LocalDateTime.now());
            vehicle.setExitTime(null);
            vehicle.setParkingFee(null);
            vehicle.setParkingSpot(spot);
            vehicle.setOwnerName(request.getOwnerName());
            vehicle.setOwnerPhone(request.getOwnerPhone());
            vehicle.setVehicleType(request.getVehicleType());
        } else {
            // Create new vehicle record
            vehicle = new Vehicle();
            vehicle.setLicensePlate(request.getLicensePlate());
            vehicle.setVehicleType(request.getVehicleType());
            vehicle.setOwnerName(request.getOwnerName());
            vehicle.setOwnerPhone(request.getOwnerPhone());
            vehicle.setStatus("PARKED");
            vehicle.setEntryTime(LocalDateTime.now());
            vehicle.setParkingSpot(spot);
        }

        spot.setIsAvailable(false);
        parkingSpotRepository.save(spot);

        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public Vehicle checkOut(String licensePlate) {
        Vehicle vehicle = vehicleRepository.findByLicensePlateAndStatus(licensePlate, "PARKED")
                .orElseThrow(() -> new RuntimeException("Vehicle not found or not currently parked"));

        vehicle.setExitTime(LocalDateTime.now());
        vehicle.setStatus("CHECKED_OUT");

        // Calculate parking fee
        Duration duration = Duration.between(vehicle.getEntryTime(), vehicle.getExitTime());

        // Calculate hours - always round UP partial hours
        long totalMinutes = duration.toMinutes();
        long hours = totalMinutes / 60;

        // If there are any remaining minutes, add 1 hour
        if (totalMinutes % 60 > 0) {
            hours++;
        }

        // Minimum charge: 1 hour (even for 1 second)
        if (hours == 0) {
            hours = 1;
        }

        // Calculate fee based on vehicle type
        double ratePerHour = 30.0; // Default for CAR

        if ("BIKE".equals(vehicle.getVehicleType())) {
            ratePerHour = 20.0;
        } else if ("TRUCK".equals(vehicle.getVehicleType())) {
            ratePerHour = 50.0;
        }

        double fee = hours * ratePerHour;
        vehicle.setParkingFee(fee);

        // Mark spot as available
        ParkingSpot spot = vehicle.getParkingSpot();
        spot.setIsAvailable(true);
        parkingSpotRepository.save(spot);

        return vehicleRepository.save(vehicle);
    }

    public Vehicle findVehicle(String licensePlate) {
        return vehicleRepository.findByLicensePlate(licensePlate)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
    }

    public List<Vehicle> getAllParkedVehicles() {
        return vehicleRepository.findByStatus("PARKED");
    }
}