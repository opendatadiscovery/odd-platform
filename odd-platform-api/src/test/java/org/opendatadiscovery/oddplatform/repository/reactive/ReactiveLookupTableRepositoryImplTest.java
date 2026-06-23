package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesPojo;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration test for {@link ReactiveLookupTableRepository#existsByTableName} — the physical-name
 * uniqueness pre-check that backs createLookupTable's normalised-name collision guard
 * (odd-platform#1769 defect a). Against a real Postgres (Testcontainers via {@link BaseIntegrationTest}):
 * the finder returns true for a persisted physical {@code table_name} and false for an absent one.
 */
public class ReactiveLookupTableRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private ReactiveLookupTableRepository lookupTableRepository;

    @Test
    @DisplayName("existsByTableName: true for a persisted physical table_name, false for an absent one")
    public void existsByTableName() {
        final String physicalName = "n_1__it_exists_" + UUID.randomUUID().toString().replace("-", "");
        final LocalDateTime now = LocalDateTime.now();
        lookupTableRepository.create(new LookupTablesPojo()
                .setName("display name")
                .setTableName(physicalName)
                .setCreatedAt(now)
                .setUpdatedAt(now))
            .blockOptional()
            .orElseThrow();

        lookupTableRepository.existsByTableName(physicalName)
            .as(StepVerifier::create)
            .assertNext(exists -> assertThat(exists).isTrue())
            .verifyComplete();

        lookupTableRepository.existsByTableName("n_1__absent_" + UUID.randomUUID().toString().replace("-", ""))
            .as(StepVerifier::create)
            .assertNext(exists -> assertThat(exists).isFalse())
            .verifyComplete();
    }
}
