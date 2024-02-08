package org.opendatadiscovery.oddplatform.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.client.reactive.ClientHttpConnector;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import reactor.netty.http.client.HttpClient;
import java.time.Duration;

@Configuration
public class WebClientConfiguration {

    @Value("${genai.url:}")
    private String genAIUrl;

    @Bean
    public WebClient webClient() {
        final HttpClient httpClient = HttpClient.create().responseTimeout(Duration.ofMinutes(2));
        final ClientHttpConnector connector = new ReactorClientHttpConnector(httpClient);

        return WebClient.builder()
            .clientConnector(connector)
            .baseUrl(genAIUrl)
            .build();
    }
}
