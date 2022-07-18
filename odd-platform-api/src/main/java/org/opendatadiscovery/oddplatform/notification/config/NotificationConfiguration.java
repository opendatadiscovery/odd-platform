package org.opendatadiscovery.oddplatform.notification.config;

import java.net.URI;
import java.net.URL;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.opendatadiscovery.oddplatform.notification.dto.AlertNotificationMessage;
import org.opendatadiscovery.oddplatform.notification.processor.message.SlackNotificationMessageGenerator;
import org.opendatadiscovery.oddplatform.notification.sender.NotificationSender;
import org.opendatadiscovery.oddplatform.notification.sender.SlackNotificationSender;
import org.opendatadiscovery.oddplatform.notification.sender.WebhookNotificationSender;
import org.opendatadiscovery.oddplatform.notification.translator.AlertNotificationMessageTranslator;
import org.opendatadiscovery.oddplatform.notification.translator.NotificationMessageTranslator;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
@ConditionalOnProperty(value = "notifications.enabled", havingValue = "true")
@Slf4j
public class NotificationConfiguration {
    @Bean
    public WebClient webClient() {
        return WebClient.create();
    }

    @Bean
    @ConditionalOnProperty(name = "notifications.receivers.slack.url")
    public NotificationSender<AlertNotificationMessage> slackNotificationSender(
        @Value("${notifications.receivers.slack.url}") final URI slackWebhookUrl,
        final WebClient webClient,
        final SlackNotificationMessageGenerator messageGenerator
    ) {
        if (slackWebhookUrl.toString().isEmpty()) {
            throw new IllegalArgumentException("Slack webhook URL is empty");
        }

        return new SlackNotificationSender(webClient, slackWebhookUrl, messageGenerator);
    }

    @Bean
    @ConditionalOnProperty(name = "notifications.receivers.webhook.url")
    public NotificationSender<AlertNotificationMessage> webhookNotificationSender(
        @Value("${notifications.receivers.webhook.url}") final URI webhookUrl,
        final WebClient webClient
    ) {
        if (webhookUrl.toString().isEmpty()) {
            throw new IllegalArgumentException("Webhook URL is empty");
        }

        return new WebhookNotificationSender(webClient, webhookUrl);
    }

    @Bean
    public NotificationMessageTranslator<AlertNotificationMessage> alertNotificationMessageTranslator(
        @Value("${notifications.message.downstream-entities-depth}") final int downstreamEntitiesDepth,
        final DSLContext dslContext,
        final JooqRecordHelper jooqRecordHelper
    ) {
        if (downstreamEntitiesDepth < 0) {
            throw new IllegalArgumentException("Downstream entities depth is negative");
        }

        return new AlertNotificationMessageTranslator(dslContext, jooqRecordHelper, downstreamEntitiesDepth);
    }

    @Bean
    public SlackNotificationMessageGenerator slackNotificationMessageGenerator(
        @Value("${notifications.receivers.slack.platform-base-url}") final URL platformBaseUrl
    ) {
        return new SlackNotificationMessageGenerator(platformBaseUrl);
    }
}
