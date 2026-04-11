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
@EnableConfigurationProperties({NotificationsProperties.class, EmailSenderProperties.class})
public class NotificationConfiguration {

    @Bean
    public HttpClient httpClient() {
        return HttpClient.newHttpClient();
    }

    @Bean
    @ConditionalOnProperty(name = "notifications.receivers.email.sender")
    public JavaMailSender mailSender(final EmailSenderProperties emailProperties) {
        if (StringUtils.isBlank(emailProperties.getSender())) {
            throw new IllegalArgumentException("senderEmail is empty");
        }

        if (StringUtils.isBlank(emailProperties.getHost())) {
            throw new IllegalArgumentException("host is empty");
        }

        if (StringUtils.isBlank(emailProperties.getProtocol())) {
            throw new IllegalArgumentException("protocol is empty");
        }

        final JavaMailSenderImpl mailSender = new JavaMailSenderImpl();

        mailSender.setHost(emailProperties.getHost());
        mailSender.setPort(emailProperties.getPort());
        mailSender.setUsername(emailProperties.getSender());

        if (emailProperties.getPassword() != null) {
            mailSender.setPassword(emailProperties.getPassword());
        }

        final Properties props = mailSender.getJavaMailProperties();

        if (emailProperties.getProtocol().equals("smtp")) {
            props.put("mail.transport.protocol", "smtp");
            props.put("mail.smtp.auth", emailProperties.getSmtp().getAuth());
            props.put("mail.smtp.starttls.enable", emailProperties.getSmtp().getStarttls());
        } else {
            props.put("mail.transport.protocol", emailProperties.getProtocol());
        }

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
            @Value("${odd.platform-base-url:http://localhost:8080}") final String platformHost,
            final freemarker.template.Configuration configuration,
            final HttpClient httpClient,
            final JavaMailSender mailSender
    ) {
        if (StringUtils.isBlank(notificationEmails)) {
            throw new IllegalArgumentException("notification.emails is empty");
        }

        return new EmailNotificationSender(httpClient,
                mailSender,
                configuration,
                platformHost,
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
