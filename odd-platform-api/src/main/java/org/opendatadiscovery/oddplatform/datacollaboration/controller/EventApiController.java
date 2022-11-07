package org.opendatadiscovery.oddplatform.datacollaboration.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.datacollaboration.config.ConditionalOnDataCollaboration;
import org.opendatadiscovery.oddplatform.datacollaboration.controller.parser.SlackEventParser;
import org.opendatadiscovery.oddplatform.datacollaboration.service.DataCollaborationService;
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
    private final DataCollaborationService dataCollaborationService;
    private final SlackEventParser slackEventParser;

    @RequestMapping("/api/slack/events")
    public Mono<ResponseEntity<SlackEventResponse>> handleSlackEvent(
        @RequestBody final Mono<String> rawRequestBody
    ) {
        return rawRequestBody
            .map(slackEventParser::parse)
            .flatMap(parseResult -> switch (parseResult.type()) {
                case CHALLENGE -> SlackEventResponse.challengeResponse(parseResult.ack().body());
                case FILTER -> {
                    log.debug(parseResult.filterMessage());
                    yield SlackEventResponse.ack();
                }
                case ERROR -> {
                    log.error(parseResult.filterMessage());
                    yield SlackEventResponse.error();
                }
                case PAYLOAD -> dataCollaborationService
                    .enqueueMessageEvent(parseResult.messageEvent())
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

        public static Mono<ResponseEntity<SlackEventResponse>> error() {
            return Mono.just(ResponseEntity.badRequest().build());
        }
    }
}
