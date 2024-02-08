package org.opendatadiscovery.oddplatform.service.genai;

import io.netty.handler.timeout.ReadTimeoutException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.text.StringEscapeUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.GenAIQuestionResult;
import org.opendatadiscovery.oddplatform.api.contract.model.GenAIRequest;
import org.opendatadiscovery.oddplatform.exception.GenAIException;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.util.Map;
import java.util.concurrent.TimeoutException;

@Service
@RequiredArgsConstructor
@Slf4j
public class GenAIServiceImpl implements GenAIService {
    private final WebClient webClient;

    @Override
    public Mono<GenAIQuestionResult> getResponseFromGenAI(GenAIRequest request) {
        return webClient.post()
            .uri("/query_data")
            .bodyValue(Map.of("question", request.getQuestion()))
            .retrieve()
            .bodyToMono(String.class)
            .onErrorMap(e -> {
                if (e.getCause() instanceof ReadTimeoutException) {
                    return new TimeoutException();
                } else {
                    return new GenAIException(e);
                }
            })
            .map(item -> new GenAIQuestionResult().questionResponse(StringEscapeUtils.unescapeJava(item.replaceAll("^\"|\"$", ""))));
    }
}
