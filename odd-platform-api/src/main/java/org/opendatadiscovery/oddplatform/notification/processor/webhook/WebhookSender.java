package org.opendatadiscovery.oddplatform.notification.processor.webhook;

public interface WebhookSender {
    void send(final String webhookUrl, final String message);
}
