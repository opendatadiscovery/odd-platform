package org.opendatadiscovery.oddplatform.datacollaboration.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.google.gson.Gson;
import com.slack.api.model.event.MessageEvent;
import com.slack.api.util.json.GsonFactory;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.datacollaboration.config.ConditionalOnDataCollaboration;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.datacollaboration.service.DataCollaborationService;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@ConditionalOnDataCollaboration
@RequiredArgsConstructor
@Slf4j
public class EventApiController {
    private static final Gson GSON = GsonFactory.createSnakeCase();

    private final DataCollaborationService dataCollaborationService;

    @RequestMapping("/api/slack/events")
    public Mono<ResponseEntity<SlackEventResponse>> handleSlackEvent(
        @RequestBody final Mono<String> rawRequestBody
    ) {
        return rawRequestBody.flatMap(rawString -> {
            final Map<String, Object> requestMap =
                JSONSerDeUtils.deserializeJson(rawString, new TypeReference<>() {
                });

            final String eventType = (String) requestMap.get("type");
            if (StringUtils.equals(eventType, "url_verification")) {
                return SlackEventResponse.challengeResponse(((String) requestMap.get("challenge")));
            }

            if (!StringUtils.equals(eventType, "event_callback")) {
                log.debug("Unknown event type: {}", eventType);
                return SlackEventResponse.ack();
            }

            final MessageEvent messageEvent =
                GSON.fromJson(JSONSerDeUtils.serializeJson(requestMap.get("event")), MessageEvent.class);

            if (!"message".equals(messageEvent.getType())) {
                log.debug("Unknown event inner type: {}", eventType);
                return SlackEventResponse.ack();
            }

            if (messageEvent.getThreadTs() == null) {
                log.debug("Message {} is not a thread reply", messageEvent);
                return SlackEventResponse.ack();
            }

            return dataCollaborationService
                .enqueueMessageEvent(messageEvent, MessageProviderDto.SLACK)
                .then(SlackEventResponse.ack());
        });
    }

    record SlackEventResponse(String challenge) {
        public static Mono<ResponseEntity<SlackEventResponse>> challengeResponse(final String challenge) {
            return Mono.just(ResponseEntity.ok(new SlackEventResponse(challenge)));
        }

        public static Mono<ResponseEntity<SlackEventResponse>> ack() {
            return Mono.just(ResponseEntity.ok().build());
        }
    }
}
