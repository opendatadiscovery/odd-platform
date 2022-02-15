package org.opendatadiscovery.oddplatform.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("Integration tests for NamespaceRepository")
class NamespaceRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private NamespaceRepository namespaceRepository;

    @Test
    @DisplayName("Test creates namespace pojo, expecting namespace pojo in db")
    void testCreateNamespacePojoInDB() {
        final NamespacePojo namespacePojo = new NamespacePojo()
            .setName(UUID.randomUUID().toString());

        final NamespacePojo expectedNamespacePojo = namespaceRepository.create(namespacePojo);
        final Optional<NamespacePojo> actualNamespacePojo = namespaceRepository.get(expectedNamespacePojo.getId());

        assertTrue(actualNamespacePojo.isPresent());
        assertEquals(expectedNamespacePojo.getName(), actualNamespacePojo.get().getName());
    }

    @Test
    @DisplayName("Test creates namespace pojo if not exist in db, expecting one namespace pojo in db")
    void testCreateIfNotExistsSameName() {
        final String name = UUID.randomUUID().toString();
        final NamespacePojo pojo = new NamespacePojo()
            .setName(name);
        final NamespacePojo secondPojo = new NamespacePojo()
            .setName(name);

        final NamespacePojo expectedNamespacePojo = namespaceRepository.create(pojo);
        final NamespacePojo actualNamespacePojo = namespaceRepository.createIfNotExists(secondPojo);

        assertEquals(expectedNamespacePojo.getId(), actualNamespacePojo.getId());
        assertEquals(expectedNamespacePojo.getName(), actualNamespacePojo.getName());
    }

    @Test
    @DisplayName("Test creates namespace pojo if not exist in db, expecting two namespace pojo in db")
    void testCreateIfNotExistsDifferentName() {
        final NamespacePojo pojo = new NamespacePojo()
            .setName(UUID.randomUUID().toString());
        final NamespacePojo secondPojo = new NamespacePojo()
            .setName(UUID.randomUUID().toString());

        final NamespacePojo expectedNamespacePojo = namespaceRepository.create(pojo);
        final NamespacePojo actualNamespacePojo = namespaceRepository.createIfNotExists(secondPojo);

        assertNotEquals(expectedNamespacePojo.getId(), actualNamespacePojo.getId());
        assertNotEquals(expectedNamespacePojo.getName(), actualNamespacePojo.getName());
    }

    @Test
    @DisplayName("Test softly deletes namespace pojo from db, expecting empty db")
    void testDeleteNamespaceFromDB() {
        final NamespacePojo pojo = new NamespacePojo()
            .setName(UUID.randomUUID().toString());

        final NamespacePojo namespacePojo = namespaceRepository.create(pojo);
        namespaceRepository.delete(namespacePojo.getId());
        final Optional<NamespacePojo> actualNamespacePojo = namespaceRepository.get(namespacePojo.getId());

        assertTrue(actualNamespacePojo.isEmpty());
    }

    @Test
    @DisplayName("Test updates namespace pojo, expecting updated namespace pojo in db")
    void testUpdateNamespacePojo() {
        final NamespacePojo pojo = new NamespacePojo()
            .setName(UUID.randomUUID().toString());

        final NamespacePojo expectedNamespacePojo = namespaceRepository.create(pojo);
        final Optional<NamespacePojo> tmp = namespaceRepository.get(expectedNamespacePojo.getId());
        final NamespacePojo tmpNamespacePojo = tmp.orElseGet(NamespacePojo::new);
        tmpNamespacePojo.setName(UUID.randomUUID().toString());
        final NamespacePojo actualNamespacePojo = namespaceRepository.update(tmpNamespacePojo);

        assertEquals(expectedNamespacePojo.getId(), actualNamespacePojo.getId());
        assertNotEquals(expectedNamespacePojo.getName(), actualNamespacePojo.getName());
        assertNotEquals(expectedNamespacePojo.getUpdatedAt(), actualNamespacePojo.getUpdatedAt());
    }

    @Test
    @DisplayName("Test bulk create namespace pojo, expecting namespace pojos are created successfully")
    void testBulkCreateNamespacePojo() {
        final NamespacePojo pojo = new NamespacePojo()
            .setName(UUID.randomUUID().toString());
        final NamespacePojo pojo1 = new NamespacePojo()
            .setName(UUID.randomUUID().toString());
        final NamespacePojo pojo2 = new NamespacePojo()
            .setName(UUID.randomUUID().toString());
        final List<NamespacePojo> pojoList = List.of(pojo, pojo1, pojo2);

        final List<NamespacePojo> expectedPojoList = namespaceRepository.bulkCreate(pojoList);

        for (final NamespacePojo namespacePojo : expectedPojoList) {
            assertTrue(namespaceRepository.get(namespacePojo.getId()).isPresent());
        }
    }

    @Test
    @DisplayName("Test delete all namespace pojos, expecting namespace pojos are not present in db")
    void testDeleteAllNamespacePojo() {
        final NamespacePojo pojo = new NamespacePojo()
            .setName(UUID.randomUUID().toString());
        final NamespacePojo pojo1 = new NamespacePojo()
            .setName(UUID.randomUUID().toString());
        final NamespacePojo pojo2 = new NamespacePojo()
            .setName(UUID.randomUUID().toString());
        final List<NamespacePojo> pojoList = List.of(pojo, pojo1, pojo2);

        final List<NamespacePojo> expectedPojoList = namespaceRepository.bulkCreate(pojoList);
        final List<Long> pojoIdList = expectedPojoList.stream().map(NamespacePojo::getId).collect(Collectors.toList());
        namespaceRepository.delete(pojoIdList);

        for (final NamespacePojo namespacePojo : expectedPojoList) {
            assertFalse(namespaceRepository.get(namespacePojo.getId()).isPresent());
        }
    }

    @Test
    @DisplayName("Test bulk create namespace pojo, expecting namespace pojos are created successfully")
    void testBulkUpdateNamespacePojo() {
        final NamespacePojo pojo = new NamespacePojo()
            .setName(UUID.randomUUID().toString());
        final NamespacePojo pojo1 = new NamespacePojo()
            .setName(UUID.randomUUID().toString());
        final NamespacePojo pojo2 = new NamespacePojo()
            .setName(UUID.randomUUID().toString());
        final List<NamespacePojo> pojoList = List.of(pojo, pojo1, pojo2);

        final List<NamespacePojo> expectedPojoList = namespaceRepository.bulkCreate(pojoList);
        final List<String> expectedPojoListName =
            expectedPojoList.stream().map(NamespacePojo::getName).collect(Collectors.toList());

        final List<NamespacePojo> tmpPojoList = new ArrayList<>();
        for (final NamespacePojo namespacePojo : expectedPojoList) {
            final NamespacePojo tmpPojo = namespaceRepository.get(namespacePojo.getId()).orElseGet(NamespacePojo::new);
            tmpPojo.setName(UUID.randomUUID().toString());
            tmpPojoList.add(tmpPojo);
        }

        final List<NamespacePojo> actualNamespacePojos = namespaceRepository.bulkUpdate(tmpPojoList);
        final List<String> actualNamespacePojosNames =
            actualNamespacePojos.stream().map(NamespacePojo::getName).collect(Collectors.toList());

        final boolean anyMatch = expectedPojoListName.stream()
            .anyMatch(actualNamespacePojosNames::contains);

        assertFalse(anyMatch);
    }

    /**
     * Test case: Test create namespace pojo then delete it and then create again.
     * Expected result: Namespace pojo will not be created again, as it was not actually deleted
     */
    @Test
    @DisplayName("Test create namespace pojo then delete it and then create again")
    void testAfterDeletionCreateNamespacePojo() {
        final NamespacePojo pojo = new NamespacePojo()
            .setName(UUID.randomUUID().toString());

        final NamespacePojo expectedNamespacePojo = namespaceRepository.create(pojo);
        namespaceRepository.delete(expectedNamespacePojo.getId());
        final NamespacePojo actualNamespacePojo = namespaceRepository.create(pojo);

        assertEquals(expectedNamespacePojo.getId(), actualNamespacePojo.getId());
        assertEquals(expectedNamespacePojo.getName(), actualNamespacePojo.getName());
    }

    @Test
    void testGetByName() {
        final NamespacePojo pojo = new NamespacePojo()
            .setName(UUID.randomUUID().toString());
        final NamespacePojo createdPojo = namespaceRepository.create(pojo);
        final Optional<NamespacePojo> namespaceOpt = namespaceRepository.getByName(createdPojo.getName());
        assertThat(namespaceOpt.isPresent()).isTrue();
        final Optional<NamespacePojo> nonExistingOpt = namespaceRepository.getByName(UUID.randomUUID().toString());
        assertThat(nonExistingOpt.isPresent()).isFalse();
        namespaceRepository.delete(createdPojo.getId());
        final Optional<NamespacePojo> deletedOpt = namespaceRepository.getByName(createdPojo.getName());
        assertThat(deletedOpt.isPresent()).isFalse();
    }
}

