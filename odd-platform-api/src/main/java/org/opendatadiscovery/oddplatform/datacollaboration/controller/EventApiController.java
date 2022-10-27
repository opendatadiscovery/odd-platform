package org.opendatadiscovery.oddplatform.datacollaboration.controller;

import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@Slf4j
public class EventApiController {
    @RequestMapping("/api/slack/events")
    public Mono<ResponseEntity<Response>> test(@RequestBody final Mono<String> req,
                                               final ServerWebExchange webExchange) {
        return req.map(r -> {
            log.info("Request: {}", r);
            final Map map = JSONSerDeUtils.deserializeJson(r, Map.class);

            if (map.get("challenge") != null) {
                return ResponseEntity.ok(new Response(map.get("challenge").toString()));
            }

            return ResponseEntity.ok(null);
        });
    }

    record Response(String challenge) {
    }
}
