package com.parking.management.dto;

public class ParkingSpotRequest {
    private String spotNumber;
    private String spotType;

    public ParkingSpotRequest() {}

    public String getSpotNumber() { return spotNumber; }
    public void setSpotNumber(String spotNumber) { this.spotNumber = spotNumber; }

    public String getSpotType() { return spotType; }
    public void setSpotType(String spotType) { this.spotType = spotType; }
}