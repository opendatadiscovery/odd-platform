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

    public static final String TEST_NAME = "Test name";
    public static final long TEST_ID = 12L;

    @Autowired
    private NamespaceRepository namespaceRepository;

    @Test
    @DisplayName("Test creates namespace pojo, expecting namespace pojo in db")
    void testCreateNamespacePojoInDB() {
        final NamespacePojo expectedNamespacePojo = new NamespacePojo()
            .setName(TEST_NAME).setId(TEST_ID);

        namespaceRepository.create(expectedNamespacePojo);
        final Optional<NamespacePojo> actualNamespacePojo = namespaceRepository.get(TEST_ID);

        assertTrue(actualNamespacePojo.isPresent());
        assertEquals(expectedNamespacePojo.getName(), actualNamespacePojo.get().getName());
    }

    @Test
    @DisplayName("Test creates namespace pojo if not exist in db, expecting namespace pojo in db")
    void testCreateIfNotExists() {
        final NamespacePojo pojo = new NamespacePojo()
            .setName(TEST_NAME).setId(TEST_ID);
        namespaceRepository.create(pojo);
        final NamespacePojo secondPojo = new NamespacePojo()
            .setName(TEST_NAME).setId(13L);
        final NamespacePojo result = namespaceRepository.createIfNotExists(secondPojo);

        assertEquals(pojo.getId(), result.getId());
        assertEquals(pojo.getName(), result.getName());
    }

    @Test
    @DisplayName("Test checks initially no namespace pojo in db, expecting empty db")
    void testNoNamespacePojoInDBInitially() {
        final Optional<NamespacePojo> actualNamespacePojo = namespaceRepository.get(TEST_ID);
        assertFalse(actualNamespacePojo.isPresent());
    }

    @Test
    @DisplayName("Test softly deletes namespace pojo from db, expecting empty db")
    void testDeleteNamespaceFromDB() {
        final NamespacePojo pojo = new NamespacePojo()
            .setName(TEST_NAME).setId(TEST_ID);

        namespaceRepository.create(pojo);
        namespaceRepository.delete(pojo.getId());
        final Optional<NamespacePojo> namespaceOpt = namespaceRepository.get(pojo.getId());

        assertTrue(namespaceOpt.isEmpty());
    }
}

