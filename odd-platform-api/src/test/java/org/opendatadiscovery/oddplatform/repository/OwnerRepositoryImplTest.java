package org.opendatadiscovery.oddplatform.repository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.springframework.test.context.jdbc.Sql;

@Sql({"/scripts/clear_namespace_table.sql"})
@DisplayName("Integration tests for OwnerRepository")
class OwnerRepositoryImplTest extends BaseIntegrationTest {

    @Test
    void name() {
        //test
    }
}