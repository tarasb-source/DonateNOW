package com.donatenow.server.controller;

import com.donatenow.server.config.AppProperties;
import com.donatenow.server.dto.DonationStats;
import com.donatenow.server.model.Donation;
import com.donatenow.server.model.DonationIntent;
import com.donatenow.server.repository.DonationIntentRepository;
import com.donatenow.server.repository.DonationRepository;
import com.donatenow.server.service.DonationStatsService;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ObjectNode;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@EnableConfigurationProperties(AppProperties.class)
@WebMvcTest(controllers = DonationController.class, properties = {
        "app.public-site-url=https://donatenow.test",
        "app.every-org.base-url=https://www.every.org",
        "app.every-org.webhook-token=tok-123",
        "app.every-org.webhook-secret=test-secret"
})
class DonationControllerTest {

    private static final JsonMapper JSON = JsonMapper.builder().build();

    // The controller rate-limits per client IP, so each request gets its own IP unless a test says otherwise.
    private static final AtomicInteger NEXT_IP = new AtomicInteger(1);

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DonationIntentRepository donationIntentRepository;

    @MockitoBean
    private DonationRepository donationRepository;

    @MockitoBean
    private DonationStatsService statsService;

    @Nested
    class StartDonation {

        @Test
        void savesIntentAndReturnsEveryOrgLink() throws Exception {
            UriComponents link = everyOrgLink(donate("""
                    {"nonprofitSlug": "razom-for-ukraine", "amount": 25}
                    """));

            ArgumentCaptor<String> intentId = ArgumentCaptor.forClass(String.class);
            verify(donationIntentRepository).insert(intentId.capture(), eq("razom-for-ukraine"), eq(2500), eq("ONCE"), any());

            assertThat(link.getHost()).isEqualTo("www.every.org");
            assertThat(link.getPath()).isEqualTo("/razom-for-ukraine");
            assertThat(link.getFragment()).isEqualTo("donate");
            assertThat(param(link, "partner_donation_id")).isEqualTo(intentId.getValue());
            assertThat(param(link, "amount")).isEqualTo("25");
            assertThat(param(link, "frequency")).isEqualTo("ONCE");
            assertThat(param(link, "webhook_token")).isEqualTo("tok-123");
            assertThat(param(link, "success_url")).isEqualTo("https://donatenow.test/donate/thank-you");
            assertThat(param(link, "exit_url")).isEqualTo("https://donatenow.test/donate");
        }

        @Test
        void monthlyDonationKeepsCents() throws Exception {
            UriComponents link = everyOrgLink(donate("""
                    {"nonprofitSlug": "nova-ukraine", "amount": 10.5, "frequency": "MONTHLY"}
                    """));

            assertThat(param(link, "amount")).isEqualTo("10.50");
            assertThat(param(link, "frequency")).isEqualTo("MONTHLY");
            verify(donationIntentRepository).insert(anyString(), eq("nova-ukraine"), eq(1050), eq("MONTHLY"), any());
        }

        @Test
        void amountIsOptional() throws Exception {
            UriComponents link = everyOrgLink(donate("""
                    {"nonprofitSlug": "unitedhelpukraine"}
                    """));

            assertThat(link.getQueryParams()).doesNotContainKey("amount");
            verify(donationIntentRepository).insert(anyString(), eq("unitedhelpukraine"), isNull(), eq("ONCE"), any());
        }

        @Test
        void trimsSpacesAroundCharitySlug() throws Exception {
            donate("""
                    {"nonprofitSlug": "  razom-for-ukraine  ", "amount": 5}
                    """)
                    .andExpect(status().isCreated());

            verify(donationIntentRepository).insert(anyString(), eq("razom-for-ukraine"), eq(500), eq("ONCE"), any());
        }

        @Test
        void rejectsCharityThatIsNotOnTheList() throws Exception {
            donate("""
                    {"nonprofitSlug": "some-other-charity", "amount": 25}
                    """)
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("Unknown charity"));

            verifyNoInteractions(donationIntentRepository);
        }

        @Test
        void rejectsMissingCharity() throws Exception {
            donate("""
                    {"amount": 25}
                    """)
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.issues[0].field").value("nonprofitSlug"));

            verifyNoInteractions(donationIntentRepository);
        }

        @Test
        void rejectsAmountBelowOneDollar() throws Exception {
            donate("""
                    {"nonprofitSlug": "razom-for-ukraine", "amount": 0.5}
                    """)
                    .andExpect(status().isBadRequest());

            verifyNoInteractions(donationIntentRepository);
        }

        @Test
        void rejectsAmountAboveOneHundredThousand() throws Exception {
            donate("""
                    {"nonprofitSlug": "razom-for-ukraine", "amount": 100001}
                    """)
                    .andExpect(status().isBadRequest());

            verifyNoInteractions(donationIntentRepository);
        }

        @Test
        void rejectsUnknownFrequency() throws Exception {
            donate("""
                    {"nonprofitSlug": "razom-for-ukraine", "amount": 25, "frequency": "WEEKLY"}
                    """)
                    .andExpect(status().isBadRequest());

            verifyNoInteractions(donationIntentRepository);
        }

        @Test
        void rejectsMalformedJson() throws Exception {
            donate("{\"nonprofitSlug\": ")
                    .andExpect(status().isBadRequest());

            verifyNoInteractions(donationIntentRepository);
        }

        @Test
        void allowsTwentyAttemptsPerIpEveryTenMinutes() throws Exception {
            String body = """
                    {"nonprofitSlug": "razom-for-ukraine", "amount": 25}
                    """;
            for (int attempt = 1; attempt <= 20; attempt++) {
                donateFrom("203.0.113.50", body).andExpect(status().isCreated());
            }

            donateFrom("203.0.113.50", body)
                    .andExpect(status().isTooManyRequests())
                    .andExpect(jsonPath("$.error").value("Too many attempts. Please try again in a few minutes."));
            donateFrom("203.0.113.51", body)
                    .andExpect(status().isCreated());
        }

        private UriComponents everyOrgLink(ResultActions response) throws Exception {
            String body = response.andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
            return UriComponentsBuilder.fromUriString(JsonPath.read(body, "$.url")).build();
        }

        private String param(UriComponents link, String name) {
            return URLDecoder.decode(link.getQueryParams().getFirst(name), StandardCharsets.UTF_8);
        }
    }

    @Test
    void statsReturnsTotalRaised() throws Exception {
        when(statsService.getStats()).thenReturn(new DonationStats(1234.5, 7));

        mockMvc.perform(get("/api/donations/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRaised").value(1234.5))
                .andExpect(jsonPath("$.donationCount").value(7));
    }

    @Nested
    class Webhook {

        @Test
        void recordsDonationForIntentStartedOnOurSite() throws Exception {
            givenIntent("intent-1");

            webhook("test-secret", validPayload())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.ok").value(true));

            verify(donationRepository).insert(
                    eq("ch_123"),                               // chargeId
                    eq("intent-1"),                             // intentId
                    eq("razom-for-ukraine"),                    // nonprofitSlug
                    eq("Razom for Ukraine"),                    // nonprofitName
                    eq(2500),                                   // amountCents
                    eq(2380),                                   // netAmountCents
                    eq("USD"),                                  // currency, upper-cased
                    eq("MONTHLY"),                              // frequency
                    eq(Instant.parse("2026-11-20T15:00:00Z")),  // donatedAt
                    any());                                     // createdAt
            verify(statsService).invalidate();
        }

        @Test
        void oneTimeDonationWithThousandsSeparator() throws Exception {
            givenIntent("intent-1");
            ObjectNode payload = validPayload()
                    .put("amount", "1,000.50")
                    .put("frequency", "One-time");

            webhook("test-secret", payload).andExpect(status().isOk());

            verify(donationRepository).insert(any(), any(), any(), any(), eq(100050), any(), any(), eq("ONCE"), any(), any());
        }

        @Test
        void wrongSecretLooksLikeMissingPage() throws Exception {
            webhook("wrong-secret", validPayload())
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.error").value("Not found"));

            verifyNoInteractions(donationIntentRepository, donationRepository, statsService);
        }

        @Test
        void ignoresDonationNotStartedOnOurSite() throws Exception {
            when(donationIntentRepository.findById("intent-1")).thenReturn(Optional.empty());

            webhook("test-secret", validPayload())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.ignored").value(true));

            assertNoDonationRecorded();
        }

        @Test
        void ignoresPayloadWithoutPartnerDonationId() throws Exception {
            ObjectNode payload = validPayload();
            payload.remove("partnerDonationId");

            webhook("test-secret", payload)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.ignored").value(true));

            assertNoDonationRecorded();
        }

        @Test
        void retriedChargeIsRecordedOnce() throws Exception {
            givenIntent("intent-1");
            when(donationRepository.findByChargeId("ch_123")).thenReturn(Optional.of(mock(Donation.class)));

            webhook("test-secret", validPayload()).andExpect(status().isOk());

            assertNoDonationRecorded();
        }

        @Test
        void simultaneousRetryHittingUniqueConstraintStillSucceeds() throws Exception {
            givenIntent("intent-1");
            doThrow(new DataIntegrityViolationException("duplicate chargeId"))
                    .when(donationRepository).insert(any(), any(), any(), any(), any(), any(), any(), any(), any(), any());

            webhook("test-secret", validPayload())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.ok").value(true));
        }

        @Test
        void rejectsPayloadWithoutChargeId() throws Exception {
            ObjectNode payload = validPayload();
            payload.remove("chargeId");

            webhook("test-secret", payload)
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("Invalid payload"));

            assertNoDonationRecorded();
        }

        @Test
        void rejectsCurrencyThatIsNotThreeLetters() throws Exception {
            webhook("test-secret", validPayload().put("currency", "dollars"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("Invalid payload"));

            assertNoDonationRecorded();
        }

        @Test
        void rejectsZeroAmount() throws Exception {
            givenIntent("intent-1");

            webhook("test-secret", validPayload().put("amount", "0"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("Invalid amount or date"));

            assertNoDonationRecorded();
        }

        @Test
        void rejectsUnreadableDate() throws Exception {
            givenIntent("intent-1");

            webhook("test-secret", validPayload().put("donationDate", "yesterday"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("Invalid amount or date"));

            assertNoDonationRecorded();
        }

        private ObjectNode validPayload() {
            return (ObjectNode) JSON.readTree("""
                    {
                      "chargeId": "ch_123",
                      "partnerDonationId": "intent-1",
                      "toNonprofit": {"slug": "razom-for-ukraine", "name": "Razom for Ukraine"},
                      "amount": "25.00",
                      "netAmount": "23.80",
                      "currency": "usd",
                      "frequency": "Monthly",
                      "donationDate": "2026-11-20T15:00:00.000Z"
                    }
                    """);
        }

        private void givenIntent(String id) {
            DonationIntent intent = mock(DonationIntent.class);
            when(intent.getId()).thenReturn(id);
            when(donationIntentRepository.findById(id)).thenReturn(Optional.of(intent));
        }

        private void assertNoDonationRecorded() {
            verify(donationRepository, never()).insert(any(), any(), any(), any(), any(), any(), any(), any(), any(), any());
        }

        private ResultActions webhook(String secret, ObjectNode payload) throws Exception {
            return mockMvc.perform(post("/api/donations/webhook/" + secret)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload.toString()));
        }
    }

    private ResultActions donate(String body) throws Exception {
        return donateFrom("198.51.100." + NEXT_IP.getAndIncrement(), body);
    }

    private ResultActions donateFrom(String ip, String body) throws Exception {
        return mockMvc.perform(post("/api/donations")
                .header("X-Forwarded-For", ip)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body));
    }
}
