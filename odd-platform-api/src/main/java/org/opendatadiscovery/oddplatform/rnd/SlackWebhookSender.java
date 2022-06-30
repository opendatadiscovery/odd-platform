package org.opendatadiscovery.oddplatform.rnd;

import java.net.URI;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
@Slf4j
public class SlackWebhookSender implements WebhookSender {
    @Override
    public Mono<Void> send(final String webhookUrl, final String message) {
        final WebClient webClient = WebClient.create();

        return webClient.post()
            .uri(URI.create(webhookUrl))
            .contentType(MediaType.APPLICATION_JSON)
            .body(BodyInserters.fromValue("{\"text\":\"" + message + "\"}"))
            .retrieve()
            .bodyToMono(String.class)
            .then();
    }
}
