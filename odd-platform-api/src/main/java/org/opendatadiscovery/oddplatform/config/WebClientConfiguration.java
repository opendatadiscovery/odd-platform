package org.opendatadiscovery.oddplatform.config;

import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.config.properties.GenAIProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ClientHttpConnector;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

@Configuration
@EnableConfigurationProperties(GenAIProperties.class)
@RequiredArgsConstructor
public class WebClientConfiguration {
    private final GenAIProperties genAIProperties;

    @Bean("genAiWebClient")
    public WebClient webClient() {
        final HttpClient httpClient = HttpClient.create()
            .responseTimeout(Duration.ofMinutes(genAIProperties.getRequestTimeout()));
        final ClientHttpConnector connector = new ReactorClientHttpConnector(httpClient);

        return WebClient.builder()
            .clientConnector(connector)
            .baseUrl(genAIProperties.getUrl())
            .build();
    }
}
