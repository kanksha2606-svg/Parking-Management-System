package com.parking.management.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
@Table(name = "parking_spots")
public class ParkingSpot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String spotNumber;

    @Column(nullable = false)
    private String spotType;

    @Column(nullable = false)
    private Boolean isAvailable = true;

    @OneToMany(mappedBy = "parkingSpot")
    @JsonIgnore
    private List<Vehicle> vehicles;

    public ParkingSpot() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSpotNumber() { return spotNumber; }
    public void setSpotNumber(String spotNumber) { this.spotNumber = spotNumber; }

    public String getSpotType() { return spotType; }
    public void setSpotType(String spotType) { this.spotType = spotType; }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }

    public List<Vehicle> getVehicles() { return vehicles; }
    public void setVehicles(List<Vehicle> vehicles) { this.vehicles = vehicles; }
}