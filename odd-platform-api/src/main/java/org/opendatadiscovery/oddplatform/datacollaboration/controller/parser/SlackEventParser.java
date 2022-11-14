package org.opendatadiscovery.oddplatform.datacollaboration.controller.parser;

import com.fasterxml.jackson.core.type.TypeReference;
import com.slack.api.model.event.MessageChangedEvent;
import com.slack.api.model.event.MessageEvent;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.datacollaboration.config.ConditionalOnDataCollaboration;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventActionDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventRequest;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.utils.GsonHelper;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnDataCollaboration
@Slf4j
public class SlackEventParser {
    public ParseResult parse(final String rawJson) {
        final Map<String, Object> requestMap = JSONSerDeUtils.deserializeJson(rawJson, new TypeReference<>() {
        });

        final String eventType = (String) requestMap.get("type");

        if (StringUtils.equals(eventType, "url_verification")) {
            return ParseResult.builder()
                .type(ParseResult.ParseResultType.CHALLENGE)
                .ack(ParseResult.HttpAck
                    .builder()
                    .httpStatus(HttpStatus.OK).body((String) requestMap.get("challenge"))
                    .build())
                .build();
        }

        if (!StringUtils.equals(eventType, "event_callback")) {
            return ParseResult.builder()
                .type(ParseResult.ParseResultType.FILTER)
                .filterMessage("Unknown Slack event type: %s".formatted(eventType))
                .build();
        }

        final Map<String, Object> rawEvent = (Map<String, Object>) requestMap.get("event");

        if (rawEvent == null) {
            return ParseResult.builder()
                .type(ParseResult.ParseResultType.ERROR)
                .errorMessage("Slack event has a broken payload: %s".formatted(rawJson))
                .build();
        }

        final String innerEventType = (String) rawEvent.get("type");

        if (!"message".equals(innerEventType)) {
            return ParseResult.builder()
                .type(ParseResult.ParseResultType.FILTER)
                .filterMessage("Unknown Slack event inner type: %s".formatted(innerEventType))
                .build();
        }

        final String messageSubtype = (String) rawEvent.get("subtype");

        if (messageSubtype == null) {
            final MessageEvent messageEvent =
                GsonHelper.fromJson(JSONSerDeUtils.serializeJson(requestMap.get("event")), MessageEvent.class);

            if (messageEvent.getThreadTs() == null) {
                return ParseResult.builder()
                    .type(ParseResult.ParseResultType.FILTER)
                    .filterMessage("Slack message event is not a thread reply: %s".formatted(messageEvent))
                    .build();
            }

            return ParseResult.builder()
                .type(ParseResult.ParseResultType.PAYLOAD)
                .messageEvent(MessageEventRequest.builder()
                    .event(messageEvent)
                    .action(MessageEventActionDto.CREATE)
                    .provider(MessageProviderDto.SLACK)
                    .build())
                .build();
        }

        if ("message_changed".equals(messageSubtype)) {
            final MessageChangedEvent messageEvent = GsonHelper
                .fromJson(JSONSerDeUtils.serializeJson(requestMap.get("event")), MessageChangedEvent.class);

            if (messageEvent.getMessage().getThreadTs() == null) {
                return ParseResult.builder()
                    .type(ParseResult.ParseResultType.FILTER)
                    .filterMessage("Slack message is not a thread reply: %s".formatted(messageEvent))
                    .build();
            }

            return ParseResult.builder()
                .type(ParseResult.ParseResultType.PAYLOAD)
                .messageEvent(MessageEventRequest.builder()
                    .event(messageEvent)
                    .action(MessageEventActionDto.UPDATE)
                    .provider(MessageProviderDto.SLACK)
                    .build())
                .build();
        }

        return ParseResult.builder()
            .type(ParseResult.ParseResultType.FILTER)
            .filterMessage("Couldn't handle Slack event: %s".formatted(rawJson))
            .build();
    }
}
