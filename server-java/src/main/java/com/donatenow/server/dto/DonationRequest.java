package com.donatenow.server.dto;

import com.donatenow.server.model.DonationFrequency;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;

public record DonationRequest(
        @NotBlank String nonprofitSlug,
        @DecimalMin("1") @DecimalMax("100000") Double amount,
        DonationFrequency frequency
) {
}
