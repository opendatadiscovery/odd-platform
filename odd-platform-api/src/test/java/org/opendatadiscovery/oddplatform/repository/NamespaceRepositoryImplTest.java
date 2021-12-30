package org.opendatadiscovery.oddplatform.repository;

import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql({"/scripts/clear_namespace_table.sql"})
@DisplayName("Integration tests for NamespaceRepository")
class NamespaceRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private NamespaceRepository namespaceRepository;

    @Test
    @DisplayName("Test creates namespace pojo, expected success")
    void testCreateNamespacePojo_Success() {
        final NamespacePojo expectedNamespacePojo = new NamespacePojo()
            .setName("Test name 1").setId(12L);

        namespaceRepository.create(expectedNamespacePojo);
        final Optional<NamespacePojo> actualNamespacePojo = namespaceRepository.get(12L);

        assertTrue(actualNamespacePojo.isPresent());
        assertEquals(expectedNamespacePojo.getName(), actualNamespacePojo.get().getName());
    }

    @Test
    @DisplayName("Test createIfNotExists method")
    void testCreateIfNotExists() {
        final NamespacePojo pojo = new NamespacePojo()
            .setName("Name").setId(12L);
        namespaceRepository.create(pojo);
        final NamespacePojo secondPojo = new NamespacePojo()
            .setName("Name").setId(13L);
        final NamespacePojo result = namespaceRepository.createIfNotExists(secondPojo);

        assertEquals(pojo.getId(), result.getId());
        assertEquals(pojo.getName(), result.getName());
    }

    @Test
    @DisplayName("Test gets namespace pojo from db, expected success")
    void testGetNamespacePojoFromDB_Success() {
        final Optional<NamespacePojo> actualNamespacePojo = namespaceRepository.get(12L);
        assertFalse(actualNamespacePojo.isPresent());
    }

    @Test
    @DisplayName("Soft delete namespace from db")
    void testDeleteNamespaceFromDB() {
        final NamespacePojo pojo = new NamespacePojo()
            .setName("Test name 1").setId(12L);

        namespaceRepository.create(pojo);
        namespaceRepository.delete(pojo.getId());
        final Optional<NamespacePojo> namespaceOpt = namespaceRepository.get(pojo.getId());

        assertTrue(namespaceOpt.isEmpty());
    }
}

