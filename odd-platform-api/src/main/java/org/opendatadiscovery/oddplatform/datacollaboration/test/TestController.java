package org.opendatadiscovery.oddplatform.datacollaboration.test;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.datacollaboration.client.SlackAPIClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@Slf4j
public class TestController {
    private final SlackAPIClient slackAPIClient;

    @RequestMapping("/api/test")
    public Mono<List<String>> getChannels() {
        return slackAPIClient.getChannelNames().collectList();
    }
}