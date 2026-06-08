package org.opendatadiscovery.oddplatform.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * ADR-0070 pin (structural) — Pull/Push one wire contract.
 *
 * <p>{@code IngestionController} implements the GENERATED {@code IngestionApi} (from the shared
 * {@code ingestion-contract-server}, not a private schema), and its single {@code postDataEntityList}
 * entry delegates straight to {@code ingestionService.ingest(...)} — there is NO branch on producer
 * type (pull collectors and push producers travel the same wire and the same service path). A
 * per-producer fork here would split the one-wire contract.
 *
 * <p>This is the unit/source-scan half of ADR-0070; the full pulled-vs-pushed round-trip equivalence
 * is the integration complement. Idiom: source scan (sibling of {@link AdrContractScanTest}),
 * deterministic, no Spring context; gradle runs tests with the module root as the working dir.
 *
 * @enforces ADR-0070
 */
class AdrIngestionWireContractScanTest {

    private static final Path INGESTION_CONTROLLER =
        Path.of("src/main/java/org/opendatadiscovery/oddplatform/controller/IngestionController.java");

    private static String read(final Path p) throws IOException {
        Assertions.assertThat(Files.exists(p))
            .as("source must be readable for this structural pin; looked at %s "
                + "(gradle test working dir should be the module root)", p.toAbsolutePath())
            .isTrue();
        return Files.readString(p);
    }

    @Test
    void ingestionControllerImplementsGeneratedContract_singleIngestDelegate() throws IOException {
        final String src = read(INGESTION_CONTROLLER);
        Assertions.assertThat(src)
            .as("ADR-0070: the platform speaks the shared generated ingestion contract — IngestionController "
                + "implements IngestionApi from ingestion.contract.api (not a private schema).")
            .contains("implements IngestionApi")
            .contains("org.opendatadiscovery.oddplatform.ingestion.contract.api.IngestionApi");
        Assertions.assertThat(src)
            .as("ADR-0070: the single postDataEntityList entry delegates straight to ingestionService.ingest — one "
                + "wire for pull and push, no branch on producer type.")
            .contains("postDataEntityList")
            .contains("ingestionService::ingest");
    }
}
