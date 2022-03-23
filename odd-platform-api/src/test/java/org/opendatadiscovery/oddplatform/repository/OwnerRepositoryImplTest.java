package org.opendatadiscovery.oddplatform.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.assertj.core.api.Assertions;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@DisplayName("Integration tests for OwnerRepository")
class OwnerRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private OwnerRepository ownerRepository;

    @Test
    @DisplayName("Creates new owner, expecting owner in db")
    void testCreateOwner() {
        final OwnerPojo ownerPojo = new OwnerPojo().setName(UUID.randomUUID().toString());

        final OwnerPojo actualOwner = ownerRepository.create(ownerPojo);

        assertThat(actualOwner).isNotNull();
        assertThat(actualOwner.getId()).isNotNull();
        assertThat(actualOwner.getName()).isNotNull()
            .isEqualTo(ownerPojo.getName());
    }

    @Test
    @DisplayName("Creates owner if owner doesn't exist in db, expecting created owner in db")
    void testCreateOrGetOwner_newOwner() {
        final OwnerPojo ownerPojo = new OwnerPojo().setName(UUID.randomUUID().toString());

        final OwnerPojo actualOwner = ownerRepository.createOrGet(ownerPojo);

        assertThat(actualOwner).isNotNull();
        assertThat(actualOwner.getId()).isNotNull();
        assertThat(actualOwner.getName()).isNotNull()
            .isEqualTo(ownerPojo.getName());
    }

    @Test
    @DisplayName("Gets owner if owner exists, expecting owner is already created")
    void testCreateOrGetOwner_ExistedOwner() {
        final OwnerPojo ownerPojo = new OwnerPojo().setName(UUID.randomUUID().toString());

        final OwnerPojo savedOwner = ownerRepository.create(ownerPojo);
        final OwnerPojo actualOwner = ownerRepository.createOrGet(ownerPojo);

        assertThat(actualOwner).isNotNull();
        assertThat(actualOwner.getId()).isNotNull()
            .isEqualTo(savedOwner.getId());
        assertThat(actualOwner.getName()).isNotNull()
            .isEqualTo(savedOwner.getName());
    }

    @Test
    @DisplayName("Updates owner, expecting updated owner in db")
    void testUpdateOwner() {
        final String initialOwnerName = UUID.randomUUID().toString();
        final OwnerPojo ownerPojo = new OwnerPojo().setName(initialOwnerName);

        final OwnerPojo savedOwner = ownerRepository.create(ownerPojo);
        Assertions.assertThat(savedOwner).isNotNull();
        Assertions.assertThat(savedOwner.getId()).isNotNull();
        Assertions.assertThat(savedOwner.getName()).isNotNull()
            .isEqualTo(initialOwnerName);

        final String newOwnerName = UUID.randomUUID().toString();
        savedOwner.setName(newOwnerName);

        final OwnerPojo updatedOwner = ownerRepository.update(savedOwner);

        Assertions.assertThat(updatedOwner).isNotNull();
        Assertions.assertThat(updatedOwner.getId()).isNotNull();
        Assertions.assertThat(updatedOwner.getName()).isNotNull()
            .isEqualTo(newOwnerName);
    }

    @Test
    @DisplayName("Deletes owner, expecting no owner in db")
    void testDeletesOwner() {
        final OwnerPojo owner = new OwnerPojo().setName(UUID.randomUUID().toString());

        final OwnerPojo actualOwner = ownerRepository.create(owner);
        Assertions.assertThat(actualOwner).isNotNull();
        final Long actualOwnerId = actualOwner.getId();
        Assertions.assertThat(actualOwnerId).isNotNull();
        Assertions.assertThat(actualOwner.getName()).isNotNull();

        ownerRepository.delete(actualOwnerId);

        final Optional<OwnerPojo> deletedOwner = ownerRepository.get(actualOwnerId);
        Assertions.assertThat(deletedOwner).isEmpty();
    }

    @Test
    @DisplayName("Gets by name owner from db, expecting owner extracted successfully")
    void testGetByNameOwner() {
        final String testOwnerName = UUID.randomUUID().toString();
        final OwnerPojo owner = new OwnerPojo().setName(testOwnerName);
        ownerRepository.create(owner);

        final Optional<OwnerPojo> actualOwnerOptional = ownerRepository.getByName(testOwnerName);

        Assertions.assertThat(actualOwnerOptional).isNotEmpty();
        final OwnerPojo actualOwner = actualOwnerOptional.get();
        Assertions.assertThat(actualOwner.getId()).isNotNull();
        Assertions.assertThat(actualOwner.getName()).isNotNull()
            .isEqualTo(testOwnerName);
    }

    @Test
    @DisplayName("Gets by name owner which is not in db, expecting no owner extracted")
    void testGetByNameOwner_DifferentName() {
        final String testOwnerName = UUID.randomUUID().toString();
        final OwnerPojo owner = new OwnerPojo().setName(testOwnerName);

        ownerRepository.create(owner);

        final Optional<OwnerPojo> actualOwnerOptional = ownerRepository.getByName(UUID.randomUUID().toString());
        Assertions.assertThat(actualOwnerOptional).isEmpty();
    }

    /**
     * Test case: Bulk creation of owners.
     * Expected result:
     * 1. All saved owners have ids.
     * 2. Saved owners have same names as input bunch of owners.
     */
    @Test
    @DisplayName("Bulk creation owners, expecting owners are created successfully")
    void testBulkCreateOwners() {
        final int numberOfTestOwners = 3;
        final List<OwnerPojo> testOwnerList = createTestOwnerList(numberOfTestOwners);
        final List<String> testOwnerListNames = getListNames(testOwnerList);

        final List<OwnerPojo> actualOwnerList = ownerRepository.bulkCreate(testOwnerList);

        Assertions.assertThat(actualOwnerList)
            .isNotEmpty()
            .extracting(OwnerPojo::getId).doesNotContainNull();
        Assertions.assertThat(actualOwnerList)
            .extracting(OwnerPojo::getName).containsAll(testOwnerListNames);
    }

    /**
     * Test case: Bulk update of owners.
     * Expected result:
     * 1. All updated owners have same ids as saved owners.
     * 2. Updated owners have new names.
     */
    @Test
    @DisplayName("Bulk update owners, expecting owners are updated successfully")
    void testBulkUpdateOwner() {
        final int numberOfTestOwners = 4;
        final List<OwnerPojo> testOwnerList = createTestOwnerList(numberOfTestOwners);
        final List<String> testOwnerListNames = getListNames(testOwnerList);

        //create owners
        final List<OwnerPojo> savedOwnerList = ownerRepository.bulkCreate(testOwnerList);
        Assertions.assertThat(savedOwnerList).isNotEmpty()
            .extracting(OwnerPojo::getId).doesNotContainNull();
        Assertions.assertThat(savedOwnerList)
            .extracting(OwnerPojo::getName).containsAll(testOwnerListNames);

        //update owners
        for (final OwnerPojo owner : savedOwnerList) {
            owner.setName(UUID.randomUUID().toString());
        }
        final List<String> newOwnerListNames = getListNames(savedOwnerList);
        final List<OwnerPojo> updatedOwnerList = ownerRepository.bulkUpdate(savedOwnerList);

        Assertions.assertThat(updatedOwnerList).isNotEmpty()
            .flatExtracting(OwnerPojo::getId, OwnerPojo::getName).doesNotContainNull();
        Assertions.assertThat(updatedOwnerList)
            .extracting(OwnerPojo::getName).isEqualTo(newOwnerListNames);
    }

    /**
     * Method for the test purpose.
     * Creates list of exact number of {@link OwnerPojo}.
     *
     * @param numberOfTestOwners - number of owners inside the list
     * @return - List of {@link OwnerPojo}
     */
    @NotNull
    private List<OwnerPojo> createTestOwnerList(final int numberOfTestOwners) {
        final List<OwnerPojo> testOwnerList = new ArrayList<>();
        for (int i = 0; i < numberOfTestOwners; i++) {
            testOwnerList.add(new OwnerPojo()
                .setName(UUID.randomUUID().toString()));
        }
        return testOwnerList;
    }

    private List<String> getListNames(final List<OwnerPojo> testOwnerList) {
        return testOwnerList.stream().map(OwnerPojo::getName).toList();
    }
}