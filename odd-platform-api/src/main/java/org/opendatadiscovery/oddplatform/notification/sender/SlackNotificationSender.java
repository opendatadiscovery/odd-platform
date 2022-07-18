package org.opendatadiscovery.oddplatform.notification.sender;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.slack.api.model.block.LayoutBlock;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.notification.dto.AlertNotificationMessage;
import org.opendatadiscovery.oddplatform.notification.processor.message.SlackNotificationMessageGenerator;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

@RequiredArgsConstructor
@Slf4j
public class SlackNotificationSender implements NotificationSender<AlertNotificationMessage> {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper()
        .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
        .registerModules(new JavaTimeModule())
        .setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE)
        .setSerializationInclusion(JsonInclude.Include.NON_NULL);

    private final WebClient webClient;
    private final URI slackWebhookUrl;
    private final SlackNotificationMessageGenerator messageBuilder;

    @Override
    public void send(final AlertNotificationMessage message) {
        final List<LayoutBlock> slackMessage = messageBuilder.generate(message);

        webClient.post()
            .uri(slackWebhookUrl)
            .contentType(MediaType.APPLICATION_JSON)
            .body(BodyInserters.fromValue(serializePayload(new SlackMessage(slackMessage))))
            .retrieve()
            .bodyToMono(String.class)
            .block();
    }

    @Override
    public String receiverId() {
        return "Slack";
    }

    private String serializePayload(final SlackMessage payload) {
        if (payload == null) {
            return "{}";
        }

        try {
            return OBJECT_MAPPER.writeValueAsString(payload);
        } catch (final JsonProcessingException e) {
            throw new IllegalArgumentException("Couldn't serialize Slack payload", e);
        }
    }

    private record SlackMessage(List<LayoutBlock> blocks) {
    }
}
