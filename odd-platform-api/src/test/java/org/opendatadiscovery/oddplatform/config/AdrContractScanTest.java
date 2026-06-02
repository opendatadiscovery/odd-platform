package org.opendatadiscovery.oddplatform.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * ADR contract-shape pins — ADR-0002 (centralised path-matcher authorization) and
 * ADR-0007 (single centralised ControllerAdvice).
 *
 * <p>ADR-0002: authorization is wired ONCE (SecurityConstants.SECURITY_RULES +
 * AuthorizationCustomizer + the final {@code pathMatchers("/**").authenticated()}); there
 * is NO per-endpoint {@code @PreAuthorize}/{@code @Secured} anywhere. A scattered
 * annotation would silently move an endpoint's authz out of the one auditable table.
 *
 * <p>ADR-0007: there is exactly ONE {@code @RestControllerAdvice} (ControllerAdvice) — the
 * single exception→status mapper; no per-controller {@code @ExceptionHandler} scattering.
 *
 * <p>Idiom: source-tree scan (sibling of {@link DependencyPostureTest}'s classpath scan /
 * {@code MinioConfigRegionTest}'s source scan) — deterministic, no Spring context. Walks
 * {@code src/main/java} (gradle runs tests with the module root as the working directory).
 *
 * @enforces ADR-0002
 * @enforces ADR-0007
 */
class AdrContractScanTest {

    private static final Path SRC = Path.of("src/main/java");

    private static List<String> javaSourcesContaining(final String needle) throws IOException {
        try (Stream<Path> paths = Files.walk(SRC)) {
            return paths
                .filter(p -> p.toString().endsWith(".java"))
                .filter(p -> {
                    try {
                        return Files.readString(p).contains(needle);
                    } catch (final IOException e) {
                        return false;
                    }
                })
                .map(SRC::relativize)
                .map(Path::toString)
                .sorted()
                .toList();
        }
    }

    @Test
    void noPerEndpointAuthorizationAnnotations() throws IOException {
        Assertions.assertThat(Files.exists(SRC))
            .as("source tree must be readable; gradle test working dir should be the module root (%s)",
                SRC.toAbsolutePath())
            .isTrue();
        Assertions.assertThat(javaSourcesContaining("@PreAuthorize"))
            .as("ADR-0002: authorization is centralised (SECURITY_RULES + AuthorizationCustomizer); "
                + "no per-endpoint @PreAuthorize is allowed.")
            .isEmpty();
        Assertions.assertThat(javaSourcesContaining("@Secured"))
            .as("ADR-0002: no per-endpoint @Secured is allowed (centralised path-matcher authz).")
            .isEmpty();
    }

    @Test
    void exactlyOneCentralisedControllerAdvice() throws IOException {
        Assertions.assertThat(javaSourcesContaining("@RestControllerAdvice"))
            .as("ADR-0007: exactly one centralised @RestControllerAdvice (ControllerAdvice) maps the "
                + "exception hierarchy to status; no per-controller @ExceptionHandler scattering.")
            .hasSize(1);
    }
}
