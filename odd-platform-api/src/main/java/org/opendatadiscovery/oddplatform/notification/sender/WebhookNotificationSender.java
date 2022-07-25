package org.opendatadiscovery.oddplatform.notification.sender;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import org.opendatadiscovery.oddplatform.notification.dto.AlertNotificationMessage;
import org.opendatadiscovery.oddplatform.notification.exception.NotificationSenderException;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;

public class WebhookNotificationSender extends AbstractNotificationSender<AlertNotificationMessage> {
    private final URI webhookUrl;

    public WebhookNotificationSender(final HttpClient httpClient, final URI webhookUrl) {
        super(httpClient);
        this.webhookUrl = webhookUrl;
    }

    @Override
    public void send(final AlertNotificationMessage message) throws InterruptedException, NotificationSenderException {
        sendAndValidate(HttpRequest.newBuilder()
            .uri(webhookUrl)
            .POST(HttpRequest.BodyPublishers.ofString(JSONSerDeUtils.serializeJson(message)))
            .build());
    }

    @Override
    public String receiverId() {
        return "Generic webhook";
    }
}
