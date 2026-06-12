package org.opendatadiscovery.oddplatform.api;

import java.util.Map;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.test.web.reactive.server.WebTestClient;

/**
 * The served OpenAPI documents must actually load — the contract behind the Swagger UI.
 *
 * <p>This is the test that was MISSING when the 2026-04 Spring upgrade (spring-webflux
 * 6.1.14 → 6.2.11, commit {@code 2033822e}) silently killed the whole interactive API
 * surface: springdoc-openapi 2.2.0 invokes {@code new ControllerAdviceBean(Object)} — a
 * constructor Spring Framework 6.2 removed — while walking the platform's
 * {@code @ControllerAdvice} to build response schemas. The resulting
 * {@code NoSuchMethodError} is treated as a JVM-fatal by reactor's {@code throwIfFatal},
 * so the spec request hangs forever (no onError ever reaches the exchange) and the
 * Swagger UI sits on "Failed to load API definition" on every deployment.
 *
 * <p>These tests pin the user-meaningful contract in-process: both grouped OpenAPI
 * documents ({@code platform-api}, {@code ingestion-api} — the exact two definitions the
 * UI offers) and the {@code swagger-config} bootstrap resource the UI shell fetches first.
 * Any future springdoc × Spring binary drift of this class trips here in CI instead of
 * shipping silently. Note the deliberately swapped serving paths (application.yml):
 * {@code springdoc.api-docs.path = /api/v3/swagger-ui.html} is the JSON document root.
 *
 * @regresses #1759 (PLT-141 — springdoc 2.2.0 × Spring 6.2 NoSuchMethodError hangs the
 *     OpenAPI document request; fixed by bumping springdoc to the Boot-3.4-compatible line)
 */
@AutoConfigureWebTestClient(timeout = "60000")
public class OpenApiDocsContractTest extends BaseIntegrationTest {

    @Autowired
    private WebTestClient webTestClient;

    /** The platform-api group document loads and is a real OpenAPI document (RED on springdoc 2.2.0). */
    @Test
    public void platformApiGroupDocumentLoads() {
        webTestClient.get()
            .uri("/api/v3/swagger-ui.html/platform-api")
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.openapi").value(version -> Assertions.assertThat((String) version)
                .as("the document declares an OpenAPI 3.x version")
                .startsWith("3."))
            .jsonPath("$.paths").value(paths -> Assertions.assertThat((Map<?, ?>) paths)
                .as("the platform-api group carries the /api/** operations")
                .isNotEmpty());
    }

    /** The ingestion-api group document loads and carries the collector ingestion contract (RED on springdoc 2.2.0). */
    @Test
    public void ingestionApiGroupDocumentLoads() {
        webTestClient.get()
            .uri("/api/v3/swagger-ui.html/ingestion-api")
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.openapi").value(version -> Assertions.assertThat((String) version)
                .as("the document declares an OpenAPI 3.x version")
                .startsWith("3."))
            .jsonPath("$.paths.['/ingestion/entities']").exists();
    }

    /** The swagger-config the UI shell bootstraps from lists exactly the two definitions (lock). */
    @Test
    public void swaggerConfigListsBothGroups() {
        webTestClient.get()
            .uri("/api/v3/swagger-ui.html/swagger-config")
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.urls[?(@.name == 'platform-api')]").exists()
            .jsonPath("$.urls[?(@.name == 'ingestion-api')]").exists();
    }
}
