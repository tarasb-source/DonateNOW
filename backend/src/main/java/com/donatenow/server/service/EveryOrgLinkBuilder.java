package com.donatenow.server.service;

import com.donatenow.server.config.AppProperties;
import com.donatenow.server.model.DonationFrequency;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

public class EveryOrgLinkBuilder {

    private EveryOrgLinkBuilder() {
    }

    public static String build(AppProperties appProperties, String nonprofitSlug, String intentId, Integer amountCents, DonationFrequency frequency) {
        StringBuilder params = new StringBuilder();
        params.append("frequency=").append(frequency == DonationFrequency.MONTHLY ? "MONTHLY" : "ONCE");
        params.append("&partner_donation_id=").append(encode(intentId));
        params.append("&success_url=").append(encode(appProperties.publicSiteUrl() + "/donate/thank-you"));
        params.append("&exit_url=").append(encode(appProperties.publicSiteUrl() + "/donate"));
        params.append("&theme_color=065ab5");

        if (amountCents != null) {
            params.append("&amount=").append(encode(formatAmount(amountCents)));
        }

        String webhookToken = appProperties.everyOrg().webhookToken();
        if (webhookToken != null && !webhookToken.isEmpty()) {
            params.append("&webhook_token=").append(encode(webhookToken));
        }

        return appProperties.everyOrg().baseUrl() + "/" + encode(nonprofitSlug) + "?" + params + "#donate";
    }

    private static String formatAmount(int amountCents) {
        String formatted = String.format(Locale.ROOT, "%.2f", amountCents / 100.0);
        return formatted.endsWith(".00") ? formatted.substring(0, formatted.length() - 3) : formatted;
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
