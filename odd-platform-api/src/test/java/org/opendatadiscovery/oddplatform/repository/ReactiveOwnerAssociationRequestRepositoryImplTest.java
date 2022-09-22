package org.opendatadiscovery.oddplatform.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatus;
import org.opendatadiscovery.oddplatform.dto.AssociatedOwnerDto;
import org.opendatadiscovery.oddplatform.dto.OwnerAssociationRequestDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerAssociationRequestPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerAssociationRequestRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveUserOwnerMappingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.annotation.DirtiesContext;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

public class ReactiveOwnerAssociationRequestRepositoryImplTest extends BaseIntegrationTest {
    @Autowired
    private ReactiveOwnerAssociationRequestRepository repository;
    @Autowired
    private ReactiveOwnerRepository ownerRepository;
    @Autowired
    private ReactiveUserOwnerMappingRepository userOwnerMappingRepository;

    @Test
    public void getPendingDtoTest() {
        final OwnerPojo ownerPojo = ownerRepository.create(createOwnerPojo()).block();
        final OwnerAssociationRequestPojo pojo =
            createPojos(OwnerAssociationRequestStatus.PENDING, null, List.of(ownerPojo)).get(0);
        final OwnerAssociationRequestPojo createdPojo = repository.create(pojo).block();
        StepVerifier.create(repository.getDto(createdPojo.getId()))
            .assertNext(dto -> {
                assertThat(dto.pojo()).isEqualTo(createdPojo);
                assertThat(dto.ownerName()).isEqualTo(ownerPojo.getName());
                assertThat(dto.statusUpdatedUser()).isNull();
            }).verifyComplete();
    }

    @Test
    public void getApprovedDtoTestWithAdminOwner() {
        final OwnerPojo ownerPojo = ownerRepository.create(createOwnerPojo()).block();
        final OwnerPojo adminOwnerPojo = ownerRepository.create(createOwnerPojo()).block();
        final String adminUsername = UUID.randomUUID().toString();
        userOwnerMappingRepository.createRelation(adminUsername, adminOwnerPojo.getId()).block();
        final OwnerAssociationRequestPojo pojo =
            createPojos(OwnerAssociationRequestStatus.APPROVED, adminUsername, List.of(ownerPojo)).get(0);

        final OwnerAssociationRequestPojo createdPojo = repository.create(pojo).block();
        StepVerifier.create(repository.getDto(createdPojo.getId()))
            .assertNext(dto -> {
                assertThat(dto.pojo()).isEqualTo(createdPojo);
                assertThat(dto.ownerName()).isEqualTo(ownerPojo.getName());
                assertThat(dto.statusUpdatedUser().username()).isEqualTo(adminUsername);
                assertThat(dto.statusUpdatedUser().owner()).isEqualTo(adminOwnerPojo);
            }).verifyComplete();
    }

    @Test
    public void getApprovedDtoTestWithoutAdminOwner() {
        final OwnerPojo ownerPojo = ownerRepository.create(createOwnerPojo()).block();
        final String adminUsername = UUID.randomUUID().toString();
        final OwnerAssociationRequestPojo pojo =
            createPojos(OwnerAssociationRequestStatus.APPROVED, adminUsername, List.of(ownerPojo)).get(0);

        final OwnerAssociationRequestPojo createdPojo = repository.create(pojo).block();
        StepVerifier.create(repository.getDto(createdPojo.getId()))
            .assertNext(dto -> {
                assertThat(dto.pojo()).isEqualTo(createdPojo);
                assertThat(dto.ownerName()).isEqualTo(ownerPojo.getName());
                assertThat(dto.statusUpdatedUser().username()).isEqualTo(adminUsername);
                assertThat(dto.statusUpdatedUser().owner()).isNull();
            }).verifyComplete();
    }

    @Test
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.BEFORE_METHOD)
    public void getActiveDtoListTest() {
        final OwnerPojo firstOwner = ownerRepository.create(createOwnerPojo()).block();
        final OwnerPojo secondOwner = ownerRepository.create(createOwnerPojo()).block();
        final OwnerPojo thirdOwner = ownerRepository.create(createOwnerPojo()).block();
        final String adminUsername = UUID.randomUUID().toString();
        final List<OwnerAssociationRequestPojo> pendingPojos =
            createPojos(OwnerAssociationRequestStatus.PENDING, null, List.of(firstOwner, secondOwner));
        final List<OwnerAssociationRequestPojo> approvedPojos =
            createPojos(OwnerAssociationRequestStatus.APPROVED, adminUsername, List.of(thirdOwner));
        final List<OwnerAssociationRequestPojo> pendingCreated =
            repository.bulkCreate(pendingPojos).collectList().block();
        repository.bulkCreate(approvedPojos).collectList().block();
        StepVerifier.create(repository.getDtoList(1, 30, null, true))
            .assertNext(page -> {
                assertThat(page.getTotal()).isEqualTo(pendingPojos.size());
                assertThat(page.isHasNext()).isFalse();
                assertThat(page.getData())
                    .extracting(OwnerAssociationRequestDto::pojo)
                    .containsExactlyInAnyOrderElementsOf(pendingCreated);
                assertThat(page.getData())
                    .extracting(OwnerAssociationRequestDto::ownerName)
                    .containsExactlyInAnyOrder(firstOwner.getName(), secondOwner.getName());
                assertThat(page.getData())
                    .extracting(OwnerAssociationRequestDto::statusUpdatedUser)
                    .containsOnlyNulls();
            }).verifyComplete();
    }

    @Test
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.BEFORE_METHOD)
    public void getNotActiveDtoListTest() {
        final OwnerPojo firstOwner = ownerRepository.create(createOwnerPojo()).block();
        final OwnerPojo secondOwner = ownerRepository.create(createOwnerPojo()).block();
        final OwnerPojo thirdOwner = ownerRepository.create(createOwnerPojo()).block();
        final String adminUsername = UUID.randomUUID().toString();
        final List<OwnerAssociationRequestPojo> pendingPojos =
            createPojos(OwnerAssociationRequestStatus.PENDING, null, List.of(firstOwner, secondOwner));
        final List<OwnerAssociationRequestPojo> approvedPojos =
            createPojos(OwnerAssociationRequestStatus.APPROVED, adminUsername, List.of(thirdOwner));
        repository.bulkCreate(pendingPojos).collectList().block();
        final List<OwnerAssociationRequestPojo> approvedCreated =
            repository.bulkCreate(approvedPojos).collectList().block();
        StepVerifier.create(repository.getDtoList(1, 30, null, false))
            .assertNext(page -> {
                assertThat(page.getTotal()).isEqualTo(approvedCreated.size());
                assertThat(page.isHasNext()).isFalse();
                assertThat(page.getData())
                    .extracting(OwnerAssociationRequestDto::pojo)
                    .containsExactlyInAnyOrderElementsOf(approvedCreated);
                assertThat(page.getData())
                    .extracting(OwnerAssociationRequestDto::ownerName)
                    .containsExactlyInAnyOrder(thirdOwner.getName());
                assertThat(page.getData())
                    .extracting(OwnerAssociationRequestDto::statusUpdatedUser)
                    .extracting(AssociatedOwnerDto::username)
                    .containsExactlyInAnyOrder(adminUsername);
            }).verifyComplete();
    }

    @Test
    public void getLastRequestForUsernameTest() {
        final OwnerPojo firstOwner = ownerRepository.create(createOwnerPojo()).block();
        final String username = UUID.randomUUID().toString();
        final OwnerAssociationRequestPojo declinedPojo = createPojos(OwnerAssociationRequestStatus.DECLINED,
            username,
            UUID.randomUUID().toString(), List.of(firstOwner)).get(0);
        final OwnerAssociationRequestPojo pendingPojo = createPojos(OwnerAssociationRequestStatus.PENDING,
            username,
            null, List.of(firstOwner)).get(0);
        final OwnerAssociationRequestPojo savedDeclinedPojo = repository.create(declinedPojo).block();
        final OwnerAssociationRequestPojo savedPendingPojo = repository.create(pendingPojo).block();
        repository.getLastRequestForUsername(username)
            .as(StepVerifier::create)
            .assertNext(dto -> assertThat(dto.pojo()).isEqualTo(savedPendingPojo))
            .verifyComplete();

        repository.getLastRequestForUsername(UUID.randomUUID().toString())
            .as(StepVerifier::create)
            .verifyComplete();
    }

    private List<OwnerAssociationRequestPojo> createPojos(final OwnerAssociationRequestStatus status,
                                                          final String adminUsername,
                                                          final List<OwnerPojo> owners) {
        return createPojos(status, null, adminUsername, owners);
    }

    private List<OwnerAssociationRequestPojo> createPojos(final OwnerAssociationRequestStatus status,
                                                          final String username,
                                                          final String adminUsername,
                                                          final List<OwnerPojo> owners) {
        return owners.stream()
            .map(owner -> {
                final OwnerAssociationRequestPojo pojo = new OwnerAssociationRequestPojo();
                pojo.setUsername(username != null ? username : UUID.randomUUID().toString());
                pojo.setOwnerId(owner.getId());
                pojo.setStatus(status.getValue());
                if (status != OwnerAssociationRequestStatus.PENDING) {
                    pojo.setStatusUpdatedAt(LocalDateTime.now());
                    pojo.setStatusUpdatedBy(adminUsername);
                }
                return pojo;
            }).toList();
    }

    private OwnerPojo createOwnerPojo() {
        return new OwnerPojo()
            .setName(UUID.randomUUID().toString());
    }
}
