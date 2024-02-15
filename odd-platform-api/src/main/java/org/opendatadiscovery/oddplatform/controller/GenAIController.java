package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.GenaiApi;
import org.opendatadiscovery.oddplatform.api.contract.model.GenAIMessage;
import org.opendatadiscovery.oddplatform.service.genai.GenAIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class GenAIController implements GenaiApi {
    private final GenAIService genAIService;

    @Override
    public Mono<ResponseEntity<GenAIMessage>> genAiAsk(final Mono<GenAIMessage> genAIMessage,
                                                             final ServerWebExchange exchange) {
        return genAIMessage.flatMap(genAIService::getResponseFromGenAI)
            .map(ResponseEntity::ok);
    }
}
