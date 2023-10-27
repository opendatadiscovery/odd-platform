package org.opendatadiscovery.oddplatform.notification.config;

import java.net.URI;
import java.net.http.HttpClient;
import java.util.List;
import java.util.Properties;
import org.jooq.DSLContext;
import org.jooq.tools.StringUtils;
import org.opendatadiscovery.oddplatform.notification.dto.AlertNotificationMessage;
import org.opendatadiscovery.oddplatform.notification.processor.message.SlackMessageGenerator;
import org.opendatadiscovery.oddplatform.notification.sender.EmailNotificationSender;
import org.opendatadiscovery.oddplatform.notification.sender.NotificationSender;
import org.opendatadiscovery.oddplatform.notification.sender.SlackNotificationSender;
import org.opendatadiscovery.oddplatform.notification.sender.WebhookNotificationSender;
import org.opendatadiscovery.oddplatform.notification.translator.AlertNotificationMessageTranslator;
import org.opendatadiscovery.oddplatform.notification.translator.NotificationMessageTranslator;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

@Configuration
@ConditionalOnNotifications
@EnableConfigurationProperties(NotificationsProperties.class)
public class NotificationConfiguration {
    @Bean
    public HttpClient httpClient() {
        return HttpClient.newHttpClient();
    }

    @Bean
    @ConditionalOnProperty(name = "notifications.receivers.email.sender")
    public JavaMailSender mailSender(@Value("${notifications.receivers.email.sender}") final String senderEmail,
                                     @Value("${notifications.receivers.email.password}") final String senderPassword,
                                     @Value("${notifications.receivers.email.smpt}") final String smptHost,
                                     @Value("${notifications.receivers.email.port}") final int port) {
        if (StringUtils.isBlank(senderEmail)) {
            throw new IllegalArgumentException("senderEmail is empty");
        }

        if (StringUtils.isBlank(senderPassword)) {
            throw new IllegalArgumentException("senderPassword is empty");
        }

        if (StringUtils.isBlank(smptHost)) {
            throw new IllegalArgumentException("smptHost is empty");
        }

        final JavaMailSenderImpl mailSender = new JavaMailSenderImpl();

        mailSender.setHost(smptHost);
        mailSender.setPort(port);
        mailSender.setUsername(senderEmail);
        mailSender.setPassword(senderPassword);

        final Properties props = mailSender.getJavaMailProperties();

        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");

        return mailSender;
    }

    @Bean
    @ConditionalOnProperty(name = "notifications.receivers.slack.url")
    public NotificationSender<AlertNotificationMessage> slackNotificationSender(
        @Value("${notifications.receivers.slack.url}") final URI slackWebhookUrl,
        final HttpClient httpClient,
        final SlackMessageGenerator messageGenerator
    ) {
        if (slackWebhookUrl.toString().isEmpty()) {
            throw new IllegalArgumentException("Slack webhook URL is empty");
        }

        return new SlackNotificationSender(httpClient, slackWebhookUrl, messageGenerator);
    }

    @Bean
    @ConditionalOnProperty(name = "notifications.receivers.webhook.url")
    public NotificationSender<AlertNotificationMessage> webhookNotificationSender(
        @Value("${notifications.receivers.webhook.url}") final URI webhookUrl,
        final HttpClient httpClient
    ) {
        if (webhookUrl.toString().isEmpty()) {
            throw new IllegalArgumentException("Webhook URL is empty");
        }

        return new WebhookNotificationSender(httpClient, webhookUrl);
    }

    @Bean
    @ConditionalOnProperty(name = "notifications.receivers.email.sender")
    public NotificationSender<AlertNotificationMessage> emailNotificationSender(
            @Value("${notifications.receivers.email.notification.emails}") final String notificationEmails,
            final HttpClient httpClient,
            final JavaMailSender mailSender
    ) {
        return new EmailNotificationSender(httpClient,
                mailSender,
                List.of(notificationEmails.trim().split(",")));
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
}
