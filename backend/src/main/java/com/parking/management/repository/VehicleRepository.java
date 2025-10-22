package com.parking.management.repository;

import com.parking.management.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByLicensePlateAndStatus(String licensePlate, String status);
    List<Vehicle> findByStatus(String status);
    Optional<Vehicle> findByLicensePlate(String licensePlate);

    @Query("SELECT v FROM Vehicle v WHERE v.parkingSpot.id = :spotId AND v.status = 'PARKED'")
    Optional<Vehicle> findByParkingSpotIdAndStatus(Long spotId, String status);
}