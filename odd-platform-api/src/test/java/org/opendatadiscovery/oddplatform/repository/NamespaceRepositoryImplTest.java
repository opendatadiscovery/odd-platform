package org.opendatadiscovery.oddplatform.repository;

import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseRepositoryTest;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Integration test for {@link NamespaceRepository}.
 *
 * @author matmalik on 10.12.2021
 */
@Sql({"/scripts/dropAll.sql"})
@DisplayName("Integration tests for NamespaceRepository")
class NamespaceRepositoryImplTest extends BaseRepositoryTest {

    @Autowired
    private NamespaceRepository namespaceRepository;

    /**
     * Test case: Save {@link NamespacePojo} into db.
     * Expected result: {@link NamespacePojo} successfully saved into db.
     */
    @Test
    @DisplayName("Test creates namespace pojo, expected success")
    void test_createNamespacePojo_Success() {
        //given
        final NamespacePojo expectedNamespacePojo = new NamespacePojo()
            .setName("Test name 1").setId(12L);

        //when
        namespaceRepository.create(expectedNamespacePojo);
        final Optional<NamespacePojo> actualNamespacePojo = namespaceRepository.get(12L);

        //then
        assertTrue(actualNamespacePojo.isPresent());
        assertEquals(expectedNamespacePojo.getName(), actualNamespacePojo.get().getName());
    }

    /**
     * Test case: Nothing saved in db.
     * Expected result: Result from db is empty.
     */
    @Test
    @DisplayName("Test gets namespace pojo from db, expected success")
    void test_getNamespacePojoFromDB_Success() {
        //given

        //when
        final Optional<NamespacePojo> actualNamespacePojo = namespaceRepository.get(12L);

        //then
        assertFalse(actualNamespacePojo.isPresent());
    }
}

