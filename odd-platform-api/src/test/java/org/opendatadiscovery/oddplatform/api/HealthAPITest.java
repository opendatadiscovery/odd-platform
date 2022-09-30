package org.opendatadiscovery.oddplatform.api;

import java.net.URI;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.test.web.reactive.server.WebTestClient;

@AutoConfigureWebTestClient
public class HealthAPITest extends BaseIntegrationTest {
    @Autowired
    private WebTestClient webTestClient;

    @Test
    public void testHealthCheck() {
        webTestClient.get()
            .uri(URI.create("/actuator/health"))
            .exchange()
            .expectStatus()
            .isOk();
    }
}
