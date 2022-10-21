package org.opendatadiscovery.oddplatform.datacollaboration.test;

import java.util.List;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.datacollaboration.client.SlackAPIClient;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@Slf4j
public class TestController {
    private final SlackAPIClient slackAPIClient;

    @RequestMapping("/api/channels")
    public Mono<List<String>> getChannels() {
        return slackAPIClient.getChannelNames().collectList();
    }

    @RequestMapping(value = "/api/message", method = RequestMethod.POST)
    public Mono<Void> sendMessage(@RequestBody @Valid final Mono<PostMessageRequest> request) {
        return request.map(r -> r.channelId)
            .flatMap(c -> slackAPIClient.postMessage(c, "Boris"));
    }
}