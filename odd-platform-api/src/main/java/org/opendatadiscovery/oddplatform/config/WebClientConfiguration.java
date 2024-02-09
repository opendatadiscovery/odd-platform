package org.opendatadiscovery.oddplatform.config;

import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ClientHttpConnector;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

@Configuration
public class WebClientConfiguration {
    @Value("${genai.url:}")
    private String genAIUrl;
    @Value("${genai.request_timeout:2}")
    private Integer getAiRequestTimeout;

    @Bean("genAiWebClient")
    public WebClient webClient() {
        final HttpClient httpClient = HttpClient.create().responseTimeout(Duration.ofMinutes(getAiRequestTimeout));
        final ClientHttpConnector connector = new ReactorClientHttpConnector(httpClient);

        return WebClient.builder()
            .clientConnector(connector)
            .baseUrl(genAIUrl)
            .build();
    }
}
