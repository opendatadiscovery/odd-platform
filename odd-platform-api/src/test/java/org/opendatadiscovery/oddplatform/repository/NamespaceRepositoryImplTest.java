package org.opendatadiscovery.oddplatform.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseRepositoryTest;
import org.opendatadiscovery.oddplatform.misc.TestDataUtils;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

/**
 * Integration test for {@link NamespaceRepository}
 *
 * @author matmalik on 10.12.2021
 */
class NamespaceRepositoryImplTest extends BaseRepositoryTest {

    @Autowired
    private NamespaceRepository namespaceRepository;

    TestDataUtils testDataUtils = new TestDataUtils();

    /**
     * Test case: Save {@link NamespacePojo} into db
     * Expected result: {@link NamespacePojo} successfully saved into db
     */
    @Test
    @Sql({"/scripts/dropAll.sql", "/scripts/createAll.sql"})
    void test_createNamespacePojo_Success() {
        //given
        NamespacePojo expectedNamespacePojo = testDataUtils.createTestNamespacePojo("Test name 1", 12L);

        //when
        namespaceRepository.create(expectedNamespacePojo);

        final Optional<NamespacePojo> actualNamespacePojo = namespaceRepository.get(12L);

        //then
        assertTrue(actualNamespacePojo.isPresent());
        assertEquals(expectedNamespacePojo.getName(), actualNamespacePojo.get().getName());
    }

    /**
     * Test case: Nothing saved in db
     * Expected result: Result from db is empty
     */
    @Test
    @Sql({"/scripts/dropAll.sql", "/scripts/createAll.sql"})
    void test_getNamespacePojoFromDB_Success() {
        //given

        //when
        final Optional<NamespacePojo> actualNamespacePojo = namespaceRepository.get(12L);

        //then
        assertFalse(actualNamespacePojo.isPresent());
    }
}