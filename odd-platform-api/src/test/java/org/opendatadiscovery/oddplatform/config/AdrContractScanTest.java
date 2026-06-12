package org.opendatadiscovery.oddplatform.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * ADR contract-shape pins — ADR-0001 (OpenAPI-generated controller interfaces), ADR-0002
 * (centralised path-matcher authorization) and ADR-0007 (single centralised ControllerAdvice).
 *
 * <p>ADR-0001: every {@code @RestController} implements a generated {@code *Api} interface and
 * carries NO HTTP mapping annotation — the routes live in the generated interface. The only two
 * documented exceptions are {@code AlertManagerController} (the AlertManager webhook, OpenAPI spec
 * pending) and {@code EventApiController} (the data-collaboration Slack-events webhook). A new
 * controller that hand-rolls a {@code @*Mapping} has drifted off the contract-first wire.
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
 * @enforces ADR-0001
 * @enforces ADR-0002
 * @enforces ADR-0007
 */
class AdrContractScanTest {

    private static final Path SRC = Path.of("src/main/java");

    // @RestController but NOT @RestControllerAdvice (the \b stops the substring match: in
    // "@RestControllerAdvice" there is no word boundary between "Controller" and "Advice").
    private static final Pattern REST_CONTROLLER = Pattern.compile("@RestController\\b");
    // A controller that implements a generated interface, e.g. `implements AlertApi`.
    private static final Pattern IMPLEMENTS_API = Pattern.compile("implements\\s+\\w*Api\\b");
    private static final Pattern MAPPING_ANNOTATION =
        Pattern.compile("@(?:Request|Get|Post|Put|Delete|Patch)Mapping\\b");

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

    private static String read(final Path p) {
        try {
            return Files.readString(p);
        } catch (final IOException e) {
            return "";
        }
    }

    /** Source files of true {@code @RestController}s (excluding {@code @RestControllerAdvice}). */
    private static List<Path> restControllerSources() throws IOException {
        try (Stream<Path> paths = Files.walk(SRC)) {
            return paths
                .filter(p -> p.toString().endsWith(".java"))
                .filter(p -> REST_CONTROLLER.matcher(read(p)).find())
                .sorted()
                .toList();
        }
    }

    @Test
    void everyRestControllerImplementsGeneratedApi_exceptTheTwoDocumented() throws IOException {
        final List<Path> controllers = restControllerSources();
        Assertions.assertThat(controllers)
            .as("sanity: the @RestController scan should find the platform's controllers under %s",
                SRC.toAbsolutePath())
            .hasSizeGreaterThan(30);
        final List<String> notInterfaceBacked = controllers.stream()
            .filter(p -> !IMPLEMENTS_API.matcher(read(p)).find())
            .map(p -> p.getFileName().toString())
            .sorted()
            .toList();
        Assertions.assertThat(notInterfaceBacked)
            .as("ADR-0001: every @RestController implements a generated *Api (HTTP mappings live in the "
                + "generated interface); the ONLY exceptions are AlertManagerController + EventApiController. "
                + "A new entry here is a controller that drifted off the contract-first wire.")
            .containsExactlyInAnyOrder("AlertManagerController.java", "EventApiController.java");
    }

    @Test
    void httpMappingAnnotationsOnlyOnTheTwoExceptionControllers() throws IOException {
        final List<String> withMappings = restControllerSources().stream()
            .filter(p -> MAPPING_ANNOTATION.matcher(read(p)).find())
            .map(p -> p.getFileName().toString())
            .sorted()
            .toList();
        Assertions.assertThat(withMappings)
            .as("ADR-0001: HTTP mapping annotations (@RequestMapping/@GetMapping/…) belong in the generated "
                + "*Api interface, not on the @RestController; only the two non-interface exceptions carry them.")
            .isSubsetOf("AlertManagerController.java", "EventApiController.java");
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
