package org.opendatadiscovery.oddplatform.repository;

import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.dto.OwnershipDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TitlePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnershipRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTitleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@DisplayName("Integration tests for OwnershipRepository")
class OwnershipRepositoryImplTest extends BaseIntegrationTest {

    //repo to be tested
    @Autowired
    private ReactiveOwnershipRepository ownershipRepository;

    //additional repo
    @Autowired
    private ReactiveOwnerRepository ownerRepository;
    @Autowired
    private ReactiveTitleRepository titleRepository;

    @Test
    @DisplayName("Creates new ownership, expecting ownership in db")
    void testCreateOwnership() {
        //given
        final String ownerName = UUID.randomUUID().toString();
        final OwnerPojo savedOwner = ownerRepository.create(new OwnerPojo().setName(ownerName))
            .blockOptional()
            .orElseThrow();
        final Long savedOwnerId = savedOwner.getId();

        final String titleName = UUID.randomUUID().toString();
        final TitlePojo savedTitle = titleRepository.create(new TitlePojo().setName(titleName))
            .blockOptional()
            .orElseThrow();
        final Long savedTitleId = savedTitle.getId();

        final OwnershipPojo ownershipPojo = new OwnershipPojo()
            .setOwnerId(savedOwnerId).setTitleId(savedTitleId);

        //when
        ownershipRepository.create(ownershipPojo)
            .as(StepVerifier::create)
            .assertNext(actualOwnership -> assertOwnership(savedTitleId, savedOwnerId, actualOwnership))
            .verifyComplete();
    }

    @Test
    @DisplayName("Gets created ownership from db, expecting ownership retrieved from db")
    void testGetOwnership() {
        //given
        final String ownerName = UUID.randomUUID().toString();
        final OwnerPojo savedOwner = ownerRepository.create(new OwnerPojo().setName(ownerName))
            .blockOptional()
            .orElseThrow();
        final Long savedOwnerId = savedOwner.getId();

        final String titleName = UUID.randomUUID().toString();
        final TitlePojo savedTitle = titleRepository.create(new TitlePojo().setName(titleName))
            .blockOptional()
            .orElseThrow();
        final Long savedTitleId = savedTitle.getId();

        final OwnershipPojo testOwnership = new OwnershipPojo()
            .setOwnerId(savedOwnerId).setTitleId(savedTitleId);
        final OwnershipPojo createdOwnership = ownershipRepository.create(testOwnership)
            .blockOptional()
            .orElseThrow();

        ownershipRepository.get(createdOwnership.getId())
            .as(StepVerifier::create)
            .assertNext(actualOwnershipDto -> {
                assertThat(actualOwnershipDto).isNotNull();
                final OwnershipPojo actualOwnershipPojo = actualOwnershipDto.getOwnership();
                assertOwnership(savedTitleId, savedOwnerId, actualOwnershipPojo);
                assertOwnerAndTitle(ownerName, savedOwnerId, titleName, savedTitleId, actualOwnershipDto);
            }).verifyComplete();
    }

    @Test
    @DisplayName("Updates ownership title, expecting ownership title updated")
    void testUpdateTitleOwnership() {
        //given
        final String ownerName = UUID.randomUUID().toString();
        final OwnerPojo savedOwner = ownerRepository.create(new OwnerPojo().setName(ownerName))
            .blockOptional()
            .orElseThrow();
        final Long savedOwnerId = savedOwner.getId();

        final String titleName = UUID.randomUUID().toString();
        final TitlePojo savedTitle = titleRepository.create(new TitlePojo().setName(titleName))
            .blockOptional()
            .orElseThrow();
        final Long savedTitleId = savedTitle.getId();

        final OwnershipPojo testOwnership = new OwnershipPojo()
            .setOwnerId(savedOwnerId).setTitleId(savedTitleId);
        final OwnershipPojo createdOwnership = ownershipRepository.create(testOwnership)
            .blockOptional()
            .orElseThrow();
        assertThat(createdOwnership).isNotNull();
        assertThat(createdOwnership.getTitleId()).isEqualTo(savedTitleId);

        //new title for update
        final String newTitleName = UUID.randomUUID().toString();
        final TitlePojo newSavedTitle = titleRepository.create(new TitlePojo().setName(newTitleName))
            .blockOptional()
            .orElseThrow();
        final Long newSavedTitleId = newSavedTitle.getId();

        ownershipRepository.updateTitle(createdOwnership.getId(), newSavedTitleId)
            .as(StepVerifier::create)
            .assertNext(actualOwnershipPojo -> {
                assertThat(actualOwnershipPojo).isNotNull();
                assertOwnership(newSavedTitleId, savedOwnerId, actualOwnershipPojo);
            }).verifyComplete();

        ownershipRepository.get(createdOwnership.getId())
            .as(StepVerifier::create)
            .assertNext(actualOwnershipDto ->
                assertOwnerAndTitle(ownerName, savedOwnerId, newTitleName, newSavedTitleId, actualOwnershipDto))
            .verifyComplete();
    }

    @Test
    @DisplayName("Deletes existing ownership, expecting ownership is deleted from db")
    void testDeleteOwnership() {
        //given
        final String ownerName = UUID.randomUUID().toString();
        final OwnerPojo savedOwner = ownerRepository.create(new OwnerPojo().setName(ownerName))
            .blockOptional()
            .orElseThrow();
        final Long savedOwnerId = savedOwner.getId();

        final String titleName = UUID.randomUUID().toString();
        final TitlePojo savedTitle = titleRepository.create(new TitlePojo().setName(titleName))
            .blockOptional()
            .orElseThrow();
        final Long savedTitleId = savedTitle.getId();

        final OwnershipPojo testOwnership = new OwnershipPojo()
            .setOwnerId(savedOwnerId).setTitleId(savedTitleId);
        final OwnershipPojo createdOwnership = ownershipRepository.create(testOwnership)
            .blockOptional()
            .orElseThrow();
        final Long createdOwnershipId = createdOwnership.getId();

        ownershipRepository.delete(createdOwnershipId).block();

        ownershipRepository.get(createdOwnershipId)
            .as(StepVerifier::create)
            .verifyComplete();
    }

    private void assertOwnerAndTitle(final String ownerName, final Long savedOwnerId, final String newTitleName,
                                     final Long newSavedTitleId, final OwnershipDto actualOwnershipDto) {
        final OwnerPojo actualOwner = actualOwnershipDto.getOwner();
        assertThat(actualOwner).isNotNull();
        assertThat(actualOwner.getName()).isNotNull().isEqualTo(ownerName);
        assertThat(actualOwner.getId()).isNotNull().isEqualTo(savedOwnerId);

        final TitlePojo actualTitle = actualOwnershipDto.getTitle();
        assertThat(actualTitle).isNotNull();
        assertThat(actualTitle.getName()).isNotNull().isEqualTo(newTitleName);
        assertThat(actualTitle.getId()).isNotNull().isEqualTo(newSavedTitleId);
    }

    private void assertOwnership(final Long savedTitleId, final Long savedOwnerId,
                                 final OwnershipPojo actualOwnership) {
        assertThat(actualOwnership).isNotNull();
        assertThat(actualOwnership.getId()).isNotNull();
        assertThat(actualOwnership.getOwnerId()).isNotNull().isEqualTo(savedOwnerId);
        assertThat(actualOwnership.getTitleId()).isNotNull().isEqualTo(savedTitleId);
    }
}