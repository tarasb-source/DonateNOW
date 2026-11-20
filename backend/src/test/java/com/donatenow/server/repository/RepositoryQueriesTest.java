package com.donatenow.server.repository;

import com.donatenow.server.config.DataSourceConfig;
import com.donatenow.server.dto.DonationTotals;
import com.donatenow.server.model.Donation;
import com.donatenow.server.model.Event;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.jdbc.Sql;

import javax.sql.DataSource;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

// Runs the real SQL against an empty Postgres (CircleCI starts one). Each test creates the schema
// inside its own transaction, which is rolled back, so nothing is left behind.
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(DataSourceConfig.class)
@TestPropertySource(properties = "database.url=${TEST_DATABASE_URL}")
@EnabledIfEnvironmentVariable(named = "TEST_DATABASE_URL", matches = ".+")
@Sql("/db/test-schema.sql")
class RepositoryQueriesTest {

    private static final Instant NOW = Instant.now();
    private static final Instant ONGOING_CUTOFF = NOW.minus(Duration.ofHours(6));

    @Autowired
    private DonationIntentRepository donationIntentRepository;

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private DataSource dataSource;

    private JdbcTemplate jdbc;

    @BeforeEach
    void setUp() {
        jdbc = new JdbcTemplate(dataSource);
    }

    @Test
    void intentInsertCastsFrequencyToPostgresEnum() {
        donationIntentRepository.insert("intent-1", "razom-for-ukraine", 2500, "MONTHLY", NOW);

        assertThat(donationIntentRepository.findById("intent-1")).isPresent();
        assertThat(jdbc.queryForObject("SELECT frequency::text FROM \"DonationIntent\" WHERE id = 'intent-1'", String.class))
                .isEqualTo("MONTHLY");
    }

    @Test
    void donationInsertCanBeFoundByChargeId() {
        insertIntent("intent-1");
        insertDonation("ch_1", 2500, "USD");

        Donation donation = donationRepository.findByChargeId("ch_1").orElseThrow();
        assertThat(donation.getAmountCents()).isEqualTo(2500);
        assertThat(donation.getCurrency()).isEqualTo("USD");
    }

    @Test
    void totalsCountOnlyUsdDonations() {
        assertThat(donationRepository.totalsForUsd()).isEqualTo(new DonationTotals(0, 0));

        insertIntent("intent-1");
        insertDonation("ch_1", 2500, "USD");
        insertDonation("ch_2", 1000, "USD");
        insertDonation("ch_3", 9999, "EUR");

        assertThat(donationRepository.totalsForUsd()).isEqualTo(new DonationTotals(3500, 2));
    }

    @Test
    void duplicateChargeIdIsRejected() {
        insertIntent("intent-1");
        insertDonation("ch_1", 2500, "USD");

        // DonationController relies on this exception to ignore a webhook retry that raced the first one.
        assertThatThrownBy(() -> insertDonation("ch_1", 2500, "USD"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void upcomingIncludesOnlyApprovedEventsThatHaveNotEnded() {
        insertEvent("Next week", "APPROVED", NOW.plus(Duration.ofDays(7)), null);
        insertEvent("Tomorrow", "APPROVED", NOW.plus(Duration.ofDays(1)), null);
        insertEvent("Multi-day, started yesterday", "APPROVED", NOW.minus(Duration.ofDays(1)), NOW.plus(Duration.ofDays(1)));
        insertEvent("Started 2h ago, no end time", "APPROVED", NOW.minus(Duration.ofHours(2)), null);
        insertEvent("Started 7h ago, no end time", "APPROVED", NOW.minus(Duration.ofHours(7)), null);
        insertEvent("Ended an hour ago", "APPROVED", NOW.minus(Duration.ofHours(3)), NOW.minus(Duration.ofHours(1)));
        insertEvent("Awaiting review", "PENDING", NOW.plus(Duration.ofDays(1)), null);
        insertEvent("Rejected", "REJECTED", NOW.plus(Duration.ofDays(1)), null);

        List<Event> events = eventRepository.findUpcoming(NOW, ONGOING_CUTOFF, PageRequest.of(0, 200));

        assertThat(events).extracting(Event::getTitle).containsExactly(
                "Multi-day, started yesterday", "Started 2h ago, no end time", "Tomorrow", "Next week");
    }

    @Test
    void boundingBoxFiltersByLatitudeAndLongitude() {
        insertEventAt("Inside", "APPROVED", 40.8, -74.0);
        insertEventAt("Too far north", "APPROVED", 42.0, -74.0);
        insertEventAt("Too far east", "APPROVED", 40.8, -72.0);
        insertEventAt("Inside but pending", "PENDING", 40.8, -74.0);

        List<Event> bounded = eventRepository.findUpcomingInBoundingBox(NOW, ONGOING_CUTOFF, 40, 41.5, false, -75, -73);
        assertThat(bounded).extracting(Event::getTitle).containsExactly("Inside");

        List<Event> anyLongitude = eventRepository.findUpcomingInBoundingBox(NOW, ONGOING_CUTOFF, 40, 41.5, true, 0, 0);
        assertThat(anyLongitude).extracting(Event::getTitle).containsExactlyInAnyOrder("Inside", "Too far east");
    }

    private void insertIntent(String id) {
        donationIntentRepository.insert(id, "razom-for-ukraine", null, "ONCE", NOW);
    }

    private void insertDonation(String chargeId, int amountCents, String currency) {
        donationRepository.insert(chargeId, "intent-1", "razom-for-ukraine", "Razom for Ukraine",
                amountCents, null, currency, "ONCE", NOW, NOW);
    }

    private void insertEvent(String title, String status, Instant startsAt, Instant endsAt) {
        insertEvent(title, status, startsAt, endsAt, 0, 0);
    }

    private void insertEventAt(String title, String status, double latitude, double longitude) {
        insertEvent(title, status, NOW.plus(Duration.ofDays(1)), null, latitude, longitude);
    }

    private void insertEvent(String title, String status, Instant startsAt, Instant endsAt, double latitude, double longitude) {
        jdbc.update("""
                        INSERT INTO "Event" (title, organization, city, country, latitude, longitude, "startsAt", "endsAt", status)
                        VALUES (?, 'Test org', 'Test city', 'Test country', ?, ?, ?, ?, CAST(? AS "EventStatus"))
                        """,
                title, latitude, longitude, Timestamp.from(startsAt), endsAt == null ? null : Timestamp.from(endsAt), status);
    }
}
