package org.opendatadiscovery.oddplatform.repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.assertj.core.api.Assertions;
import org.assertj.core.api.AssertionsForClassTypes;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatus;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerAssociationRequestPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerAssociationRequestRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerRepository;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.annotation.DirtiesContext;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Integration tests for OwnerRepository")
class OwnerRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private ReactiveOwnerRepository ownerRepository;

    @Autowired
    private ReactiveOwnerAssociationRequestRepository associationRequestRepository;

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

    @Test
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.BEFORE_METHOD)
    void testListOwner() {
        final int numberOfTestOwners = 10;
        final List<OwnerPojo> testOwnerList = createTestOwnerList(numberOfTestOwners);
        ownerRepository.bulkCreate(testOwnerList)
            .collectList()
            .block();

        final Mono<Page<OwnerPojo>> pageMono = ownerRepository.list(1, 5, null, List.of(), null);
        StepVerifier.create(pageMono)
            .assertNext(page -> {
                assertThat(page.getTotal()).isEqualTo(numberOfTestOwners);
                assertThat(page.isHasNext()).isTrue();
                assertThat(page.getData())
                    .hasSize(5);
            }).verifyComplete();

        final Mono<Page<OwnerPojo>> secondPageMono = ownerRepository.list(2, 5, null, List.of(), null);
        StepVerifier.create(secondPageMono)
            .assertNext(page -> {
                assertThat(page.getTotal()).isEqualTo(numberOfTestOwners);
                assertThat(page.isHasNext()).isFalse();
                assertThat(page.getData())
                    .hasSize(5);
            }).verifyComplete();
    }

    @Test
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.BEFORE_METHOD)
    void testListAllowedForSyncOwners() {
        final int numberOfTestOwners = 10;
        final List<OwnerPojo> testOwnerList = createTestOwnerList(numberOfTestOwners);
        final List<OwnerPojo> savedOwners = ownerRepository.bulkCreate(testOwnerList)
            .collectList()
            .block();
        final OwnerAssociationRequestPojo pendingPojo =
            createAssociationPojo(savedOwners.get(0).getId(), OwnerAssociationRequestStatus.PENDING);
        final OwnerAssociationRequestPojo approvedPojo =
            createAssociationPojo(savedOwners.get(1).getId(), OwnerAssociationRequestStatus.APPROVED);
        final OwnerAssociationRequestPojo declinedPojo =
            createAssociationPojo(savedOwners.get(2).getId(), OwnerAssociationRequestStatus.DECLINED);
        final OwnerAssociationRequestPojo secondPending =
            createAssociationPojo(savedOwners.get(2).getId(), OwnerAssociationRequestStatus.PENDING);
        final OwnerAssociationRequestPojo secondDeclined =
            createAssociationPojo(savedOwners.get(3).getId(), OwnerAssociationRequestStatus.DECLINED);
        associationRequestRepository.bulkCreate(
            List.of(pendingPojo, approvedPojo, declinedPojo, secondPending, secondDeclined)).collectList().block();

        final Mono<Page<OwnerPojo>> pageMono = ownerRepository.list(1, numberOfTestOwners, null, List.of(), true);
        StepVerifier.create(pageMono)
            .assertNext(page -> {
                assertThat(page.getTotal()).isEqualTo(numberOfTestOwners - 3);
                assertThat(page.isHasNext()).isFalse();
                assertThat(page.getData())
                    .hasSize(numberOfTestOwners - 3);
                assertThat(page.getData())
                    .extracting(OwnerPojo::getId)
                    .doesNotContain(savedOwners.get(0).getId(), savedOwners.get(1).getId(), savedOwners.get(2).getId());
            }).verifyComplete();

        final Mono<Page<OwnerPojo>> notAllowedToSyncMono =
            ownerRepository.list(1, numberOfTestOwners, null, List.of(), false);
        StepVerifier.create(notAllowedToSyncMono)
            .assertNext(page -> {
                assertThat(page.getTotal()).isEqualTo(numberOfTestOwners - 7);
                assertThat(page.isHasNext()).isFalse();
                assertThat(page.getData())
                    .hasSize(numberOfTestOwners - 7);
                assertThat(page.getData())
                    .extracting(OwnerPojo::getId)
                    .containsExactlyInAnyOrder(savedOwners.get(0).getId(), savedOwners.get(1).getId(),
                        savedOwners.get(2).getId());
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

    private OwnerAssociationRequestPojo createAssociationPojo(final Long ownerId,
                                                              final OwnerAssociationRequestStatus status) {
        final OwnerAssociationRequestPojo pojo = new OwnerAssociationRequestPojo()
            .setOwnerId(ownerId)
            .setUsername(UUID.randomUUID().toString())
            .setStatus(status.getValue())
            .setCreatedAt(LocalDateTime.now());
        if (status != OwnerAssociationRequestStatus.PENDING) {
            pojo.setStatusUpdatedBy(UUID.randomUUID().toString());
            pojo.setStatusUpdatedAt(LocalDateTime.now());
        }
        return pojo;
    }

    private List<String> getListNames(final List<OwnerPojo> testOwnerList) {
        return testOwnerList.stream().map(OwnerPojo::getName).toList();
    }
}