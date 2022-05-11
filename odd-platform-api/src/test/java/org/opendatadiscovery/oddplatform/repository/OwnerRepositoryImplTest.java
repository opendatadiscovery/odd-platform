package org.opendatadiscovery.oddplatform.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.assertj.core.api.Assertions;
import org.assertj.core.api.AssertionsForClassTypes;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@DisplayName("Integration tests for OwnerRepository")
class OwnerRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private ReactiveOwnerRepository ownerRepository;

    @Test
    @DisplayName("Creates new owner, expecting owner in db")
    void testCreateOwner() {
        final OwnerPojo ownerPojo = new OwnerPojo().setName(UUID.randomUUID().toString());

        ownerRepository.create(ownerPojo)
            .as(StepVerifier::create)
            .assertNext(actualOwner -> {
                AssertionsForClassTypes.assertThat(actualOwner).isNotNull();
                AssertionsForClassTypes.assertThat(actualOwner.getId()).isNotNull();
                AssertionsForClassTypes.assertThat(actualOwner.getName()).isNotNull()
                    .isEqualTo(ownerPojo.getName());
            }).verifyComplete();
    }

    @Test
    @DisplayName("Updates owner, expecting updated owner in db")
    void testUpdateOwner() {
        final String initialOwnerName = UUID.randomUUID().toString();
        final OwnerPojo ownerPojo = new OwnerPojo().setName(initialOwnerName);

        final OwnerPojo savedOwner = ownerRepository.create(ownerPojo).block();
        Assertions.assertThat(savedOwner).isNotNull();
        Assertions.assertThat(savedOwner.getId()).isNotNull();
        Assertions.assertThat(savedOwner.getName()).isNotNull()
            .isEqualTo(initialOwnerName);

        final String newOwnerName = UUID.randomUUID().toString();
        savedOwner.setName(newOwnerName);

        ownerRepository.update(savedOwner)
            .as(StepVerifier::create)
            .assertNext(updatedOwner -> {
                Assertions.assertThat(updatedOwner).isNotNull();
                Assertions.assertThat(updatedOwner.getId()).isNotNull();
                Assertions.assertThat(updatedOwner.getName()).isNotNull()
                    .isEqualTo(newOwnerName);
            }).verifyComplete();
    }

    @Test
    @DisplayName("Deletes owner, expecting no owner in db")
    void testDeletesOwner() {
        final OwnerPojo owner = new OwnerPojo().setName(UUID.randomUUID().toString());

        final OwnerPojo actualOwner = ownerRepository.create(owner).block();
        Assertions.assertThat(actualOwner).isNotNull();
        final Long actualOwnerId = actualOwner.getId();
        Assertions.assertThat(actualOwnerId).isNotNull();
        Assertions.assertThat(actualOwner.getName()).isNotNull();

        ownerRepository.delete(actualOwnerId).block();

        ownerRepository.get(actualOwnerId)
            .as(StepVerifier::create)
            .verifyComplete();
    }

    @Test
    @DisplayName("Gets by name owner from db, expecting owner extracted successfully")
    void testGetByNameOwner() {
        final String testOwnerName = UUID.randomUUID().toString();
        final OwnerPojo owner = new OwnerPojo().setName(testOwnerName);
        ownerRepository.create(owner).block();

        ownerRepository.getByName(testOwnerName)
            .as(StepVerifier::create)
            .assertNext(actualOwner -> {
                Assertions.assertThat(actualOwner.getId()).isNotNull();
                Assertions.assertThat(actualOwner.getName()).isEqualTo(owner.getName());
            }).verifyComplete();
    }

    @Test
    @DisplayName("Gets by name owner which is not in db, expecting no owner extracted")
    void testGetByNameOwner_DifferentName() {
        final String testOwnerName = UUID.randomUUID().toString();
        final OwnerPojo owner = new OwnerPojo().setName(testOwnerName);

        ownerRepository.create(owner).block();

        ownerRepository.getByName(UUID.randomUUID().toString())
            .as(StepVerifier::create)
            .verifyComplete();
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

        ownerRepository.bulkCreate(testOwnerList)
            .collectList()
            .as(StepVerifier::create)
            .assertNext(actualOwnerList -> {
                assertThat(actualOwnerList)
                    .isNotEmpty()
                    .extracting(OwnerPojo::getId).doesNotContainNull();
                assertThat(actualOwnerList)
                    .extracting(OwnerPojo::getName)
                    .containsExactlyInAnyOrder(testOwnerListNames.toArray(String[]::new));
            }).verifyComplete();
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
        final List<OwnerPojo> savedOwnerList = ownerRepository.bulkCreate(testOwnerList)
            .collectList()
            .block();
        assertThat(savedOwnerList).isNotEmpty()
            .extracting(OwnerPojo::getId).doesNotContainNull();
        assertThat(savedOwnerList)
            .extracting(OwnerPojo::getName).containsAll(testOwnerListNames);

        //update owners
        for (final OwnerPojo owner : savedOwnerList) {
            owner.setName(UUID.randomUUID().toString());
        }
        final List<String> newOwnerListNames = getListNames(savedOwnerList);
        ownerRepository.bulkUpdate(savedOwnerList)
            .collectList()
            .as(StepVerifier::create)
            .assertNext(updatedOwnerList -> {
                assertThat(updatedOwnerList).isNotEmpty()
                    .flatExtracting(OwnerPojo::getId, OwnerPojo::getName).doesNotContainNull();
                assertThat(updatedOwnerList)
                    .extracting(OwnerPojo::getName)
                    .containsExactlyInAnyOrder(newOwnerListNames.toArray(String[]::new));
            }).verifyComplete();
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