package com.parking.management.model;

import jakarta.persistence.*;

@Entity
@Table(name = "parking_rates")
public class ParkingRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String vehicleType;

    @Column(nullable = false)
    private Double hourlyRate;

    public ParkingRate() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public Double getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(Double hourlyRate) { this.hourlyRate = hourlyRate; }
}