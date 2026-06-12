package org.opendatadiscovery.oddplatform.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * ADR-0073 pin (schema, structural) — ODDRN universal identity.
 *
 * <p>ODDRN is the universal identity key: the base migration enforces a UNIQUE index on
 * {@code data_entity(oddrn)} ({@code ix_unique_data_entity_oddrn}), so re-ingesting the same ODDRN
 * updates-in-place rather than duplicating a row (idempotent ingestion keyed by ODDRN). Dropping that
 * uniqueness would let a collector re-run silently fork every entity.
 *
 * <p>This is the unit/schema-scan half of ADR-0073; the DB-backed re-ingest idempotency round-trip is
 * the integration complement. Idiom: scan the real base migration
 * ({@code src/main/resources/db/migration/V0_0_1__init.sql}) — deterministic, no Spring context.
 *
 * @enforces ADR-0073
 */
class AdrOddrnIdentityScanTest {

    private static final Path INIT_MIGRATION =
        Path.of("src/main/resources/db/migration/V0_0_1__init.sql");

    private static String read(final Path p) throws IOException {
        Assertions.assertThat(Files.exists(p))
            .as("migration must be readable for this schema pin; looked at %s "
                + "(gradle test working dir should be the module root)", p.toAbsolutePath())
            .isTrue();
        return Files.readString(p);
    }

    @Test
    void dataEntityOddrnHasAUniqueIndex() throws IOException {
        Assertions.assertThat(read(INIT_MIGRATION))
            .as("ADR-0073: ODDRN is the universal identity — the base migration creates a UNIQUE index on "
                + "data_entity(oddrn), so re-ingesting the same ODDRN updates-in-place and never forks the entity. "
                + "Dropping this uniqueness breaks ODDRN-keyed idempotent ingestion.")
            .contains("CREATE UNIQUE INDEX ix_unique_data_entity_oddrn")
            .contains("ON data_entity USING btree (oddrn)");
    }
}
