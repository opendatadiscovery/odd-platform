package org.opendatadiscovery.oddplatform.notification.sender;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.slack.api.model.block.LayoutBlock;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.notification.dto.AlertNotificationMessage;
import org.opendatadiscovery.oddplatform.notification.exception.NotificationSenderException;
import org.opendatadiscovery.oddplatform.notification.processor.message.SlackMessageGenerator;

@Slf4j
public class SlackNotificationSender extends AbstractNotificationSender<AlertNotificationMessage> {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper()
        .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
        .registerModules(new JavaTimeModule())
        .setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE)
        .setSerializationInclusion(JsonInclude.Include.NON_NULL);

    private final URI slackWebhookUrl;
    private final SlackMessageGenerator messageBuilder;

    public SlackNotificationSender(final HttpClient httpClient,
                                   final URI slackWebhookUrl,
                                   final SlackMessageGenerator messageBuilder) {
        super(httpClient);

        this.slackWebhookUrl = slackWebhookUrl;
        this.messageBuilder = messageBuilder;
    }

    @Override
    public void send(final AlertNotificationMessage message) throws InterruptedException, NotificationSenderException {
        final List<LayoutBlock> slackMessage = messageBuilder.generateAlertMessage(message);

        final HttpRequest request = HttpRequest.newBuilder()
            .uri(slackWebhookUrl)
            .POST(HttpRequest.BodyPublishers.ofString(serializePayload(new SlackMessage(slackMessage))))
            .build();

        sendAndValidate(request);
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
