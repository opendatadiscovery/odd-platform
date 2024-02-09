package org.opendatadiscovery.oddplatform.service.genai;

import io.netty.handler.timeout.ReadTimeoutException;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.text.StringEscapeUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.GenAIRequest;
import org.opendatadiscovery.oddplatform.api.contract.model.GenAIResponse;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.GenAIException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Slf4j
@Service
public class GenAIServiceImpl implements GenAIService {
    public static final String QUERY_DATA = "/query_data";
    public static final String QUESTION_FIELD = "question";

    @Value("${genai.url:}")
    private String genAIUrl;

    @Value("${genai.request_timeout:2}")
    private Integer getAiRequestTimeout;

    @Autowired
    @Qualifier("genAiWebClient")
    private WebClient webClient;

    @Override
    public Mono<GenAIResponse> getResponseFromGenAI(final GenAIRequest request) {
        if (StringUtils.isBlank(genAIUrl)) {
            return Mono.error(new BadUserRequestException("Gen AI is disabled"));
        }

        return webClient.post()
            .uri(QUERY_DATA)
            .bodyValue(Map.of(QUESTION_FIELD, request.getBody()))
            .retrieve()
            .bodyToMono(String.class)
            .map(item -> new GenAIResponse()
                .body(StringEscapeUtils.unescapeJava(item.replaceAll("^\"|\"$", ""))))
            .onErrorResume(e -> e.getCause() instanceof ReadTimeoutException
                ? Mono.error(new GenAIException(
                    "Gen AI request take longer that %s min".formatted(getAiRequestTimeout)))
                : Mono.error(new GenAIException(e)));
    }
}
