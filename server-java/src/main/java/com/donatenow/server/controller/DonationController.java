package com.donatenow.server.controller;

import com.donatenow.server.config.AppProperties;
import com.donatenow.server.dto.DonationRequest;
import com.donatenow.server.dto.DonationStats;
import com.donatenow.server.exception.RateLimitExceededException;
import com.donatenow.server.model.Donation;
import com.donatenow.server.model.DonationFrequency;
import com.donatenow.server.model.DonationIntent;
import com.donatenow.server.repository.DonationIntentRepository;
import com.donatenow.server.repository.DonationRepository;
import com.donatenow.server.service.Charities;
import com.donatenow.server.service.DonationStatsService;
import com.donatenow.server.service.EveryOrgLinkBuilder;
import com.donatenow.server.util.ClientIp;
import com.donatenow.server.util.RateLimiter;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.JsonNode;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.Map;

@RestController
@RequestMapping("/api/donations")
public class DonationController {

    private final DonationIntentRepository donationIntentRepository;
    private final DonationRepository donationRepository;
    private final DonationStatsService statsService;
    private final AppProperties appProperties;
    private final RateLimiter intentRateLimiter = new RateLimiter(20, Duration.ofMinutes(10));

    public DonationController(
            DonationIntentRepository donationIntentRepository,
            DonationRepository donationRepository,
            DonationStatsService statsService,
            AppProperties appProperties
    ) {
        this.donationIntentRepository = donationIntentRepository;
        this.donationRepository = donationRepository;
        this.statsService = statsService;
        this.appProperties = appProperties;
    }

    @PostMapping
    public ResponseEntity<Object> startDonation(@Valid @RequestBody DonationRequest request, HttpServletRequest httpRequest) {
        if (!intentRateLimiter.tryAcquire(ClientIp.resolve(httpRequest))) {
            throw new RateLimitExceededException("Too many attempts. Please try again in a few minutes.");
        }

        String nonprofitSlug = request.nonprofitSlug().trim();
        if (!Charities.isDonatable(nonprofitSlug)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Unknown charity"));
        }

        Integer amountCents = request.amount() != null ? (int) Math.round(request.amount() * 100) : null;
        DonationFrequency frequency = request.frequency() != null ? request.frequency() : DonationFrequency.ONCE;

        DonationIntent intent = new DonationIntent(nonprofitSlug, amountCents, frequency);
        donationIntentRepository.save(intent);

        String url = EveryOrgLinkBuilder.build(appProperties, nonprofitSlug, intent.getId(), amountCents, frequency);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("url", url));
    }

    @GetMapping("/stats")
    public DonationStats getStats() {
        return statsService.getStats();
    }

    @PostMapping("/webhook/{secret}")
    public ResponseEntity<Object> webhook(@PathVariable String secret, @RequestBody JsonNode body) {
        if (!secretMatches(secret)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Not found"));
        }

        String chargeId = body.path("chargeId").asText(null);
        String nonprofitSlug = body.path("toNonprofit").path("slug").asText(null);
        String nonprofitName = body.path("toNonprofit").path("name").asText(nonprofitSlug);
        String currency = body.path("currency").asText(null);
        String donationDate = body.path("donationDate").asText(null);

        if (chargeId == null || nonprofitSlug == null || currency == null || currency.length() != 3 || donationDate == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid payload"));
        }

        String partnerDonationId = body.hasNonNull("partnerDonationId") ? body.get("partnerDonationId").asText() : null;
        DonationIntent intent = partnerDonationId != null ? donationIntentRepository.findById(partnerDonationId).orElse(null) : null;
        if (intent == null) {
            return ResponseEntity.ok(Map.of("ok", true, "ignored", true));
        }

        Integer amountCents = toCents(body.path("amount"));
        Instant donatedAt = parseInstant(donationDate);
        if (amountCents == null || amountCents <= 0 || donatedAt == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid amount or date"));
        }

        Integer netAmountCents = body.hasNonNull("netAmount") ? toCents(body.path("netAmount")) : null;
        String frequencyRaw = body.path("frequency").asText("");
        DonationFrequency frequency = frequencyRaw.toLowerCase().contains("month") ? DonationFrequency.MONTHLY : DonationFrequency.ONCE;

        recordDonation(chargeId, intent.getId(), nonprofitSlug, nonprofitName, amountCents, netAmountCents, currency.toUpperCase(), frequency, donatedAt);
        statsService.invalidate();

        return ResponseEntity.ok(Map.of("ok", true));
    }

    private void recordDonation(
            String chargeId, String intentId, String nonprofitSlug, String nonprofitName,
            Integer amountCents, Integer netAmountCents, String currency, DonationFrequency frequency, Instant donatedAt
    ) {
        if (donationRepository.findByChargeId(chargeId).isPresent()) {
            return;
        }
        try {
            donationRepository.save(new Donation(chargeId, intentId, nonprofitSlug, nonprofitName, amountCents, netAmountCents, currency, frequency, donatedAt));
        } catch (DataIntegrityViolationException alreadyRecordedByConcurrentRetry) {
        }
    }

    private boolean secretMatches(String given) {
        String expected = appProperties.everyOrg().webhookSecret();
        if (expected == null || expected.isEmpty()) {
            return false;
        }
        byte[] expectedBytes = expected.getBytes(StandardCharsets.UTF_8);
        byte[] givenBytes = (given == null ? "" : given).getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(expectedBytes, givenBytes);
    }

    private Integer toCents(JsonNode node) {
        if (node == null || node.isNull() || node.isMissingNode()) {
            return null;
        }
        try {
            double value = Double.parseDouble(node.asText().replace(",", ""));
            return (int) Math.round(value * 100);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Instant parseInstant(String text) {
        try {
            return Instant.parse(text);
        } catch (DateTimeParseException e) {
            try {
                return OffsetDateTime.parse(text).toInstant();
            } catch (DateTimeParseException e2) {
                return null;
            }
        }
    }
}
