package com.example.cabunity.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class CreateRideRequest {
    private String originAddress;
    private String destinationAddress;
    private double originLat;
    private double originLng;
    private double destLat;
    private double destLng;
    private int requestedSeats;

    @JsonProperty("isShared")
    private boolean isShared;
}
