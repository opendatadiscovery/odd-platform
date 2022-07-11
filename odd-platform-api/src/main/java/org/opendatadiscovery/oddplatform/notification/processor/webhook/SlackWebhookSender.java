package org.opendatadiscovery.oddplatform.notification.processor.webhook;

import java.net.URI;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@Slf4j
public class SlackWebhookSender implements WebhookSender {
    private final WebClient webClient = WebClient.create();

    @Override
    public void send(final String webhookUrl, final String message) {
        webClient.post()
            .uri(URI.create(webhookUrl))
            .contentType(MediaType.APPLICATION_JSON)
            .body(BodyInserters.fromValue(new SlackMessage(message).toJsonString()))
            .retrieve()
            .bodyToMono(String.class)
            .block();
    }

    private record SlackMessage(String message) {
        public String toJsonString() {
            return JSONSerDeUtils.serializeJson(Map.of("text", message));
        }
    }
}
