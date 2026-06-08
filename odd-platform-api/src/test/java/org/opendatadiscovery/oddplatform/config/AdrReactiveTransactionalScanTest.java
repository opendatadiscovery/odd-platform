package org.opendatadiscovery.oddplatform.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * ADR-0072 pin (depth) — multi-step reactive writes are wrapped in {@code @ReactiveTransactional}.
 *
 * <p>Distinct from {@link DependencyPostureTest}'s classpath check (servlet absent / reactive present):
 * this pins that the reactive WRITE path is transactional. A multi-step write (e.g. owner update =
 * update + delete-relations + create-relations, or data-entity ingest) without {@code @ReactiveTransactional}
 * would partially commit on failure. Pins that the annotation is in real use across the write services.
 *
 * <p>Idiom: classpath-style source scan of {@code service/} (sibling of {@link AdrContractScanTest}).
 *
 * @enforces ADR-0072
 */
class AdrReactiveTransactionalScanTest {

    private static final Path SERVICE_DIR =
        Path.of("src/main/java/org/opendatadiscovery/oddplatform/service");

    private static long serviceFilesContaining(final String needle) throws IOException {
        try (Stream<Path> paths = Files.walk(SERVICE_DIR)) {
            return paths
                .filter(p -> p.toString().endsWith(".java"))
                .filter(p -> {
                    try {
                        return Files.readString(p).contains(needle);
                    } catch (final IOException e) {
                        return false;
                    }
                })
                .count();
        }
    }

    @Test
    void multiStepWriteServicesAreReactiveTransactional() throws IOException {
        Assertions.assertThat(Files.exists(SERVICE_DIR))
            .as("service tree must be readable; gradle test working dir should be the module root (%s)",
                SERVICE_DIR.toAbsolutePath())
            .isTrue();
        Assertions.assertThat(serviceFilesContaining("@ReactiveTransactional"))
            .as("ADR-0072: multi-step reactive writes are wrapped in @ReactiveTransactional so a failure rolls back "
                + "rather than partially committing — the annotation is in real use across the write services.")
            .isGreaterThanOrEqualTo(5L);
    }
}
