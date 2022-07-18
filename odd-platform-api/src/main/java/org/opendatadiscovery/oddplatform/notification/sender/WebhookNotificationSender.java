package org.opendatadiscovery.oddplatform.notification.sender;

import java.net.URI;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.notification.dto.AlertNotificationMessage;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

@RequiredArgsConstructor
public class WebhookNotificationSender implements NotificationSender<AlertNotificationMessage> {
    private final WebClient webClient;
    private final URI webhookUrl;

    @Override
    public void send(final AlertNotificationMessage message) {
        webClient.post()
            .uri(webhookUrl)
            .contentType(MediaType.APPLICATION_JSON)
            .body(BodyInserters.fromValue(JSONSerDeUtils.serializeJson(message)))
            .retrieve()
            .bodyToMono(String.class)
            .block();
    }

    @Override
    public String receiverId() {
        return "Generic webhook";
    }
}
