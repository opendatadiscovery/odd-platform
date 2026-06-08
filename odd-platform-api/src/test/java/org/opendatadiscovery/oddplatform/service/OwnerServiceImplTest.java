package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerFormData;
import org.opendatadiscovery.oddplatform.exception.CascadeDeleteException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.OwnerMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerToRoleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnershipRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermOwnershipRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveUserOwnerMappingRepository;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for the Owner lifecycle — validates F-019 (Owner Lifecycle Management), focusing
 * on the cascade-delete safety contract and the not-found paths. Exercises {@code OwnerServiceImpl} with
 * mocked collaborators (Mockito + reactor-test {@code StepVerifier}): an owner with ANY attached resource
 * (term-ownership / ownership / user-mapping) must NOT be deletable (CascadeDeleteException, no delete
 * call); an owner with none is deletable after its role bindings are cleared; reads/updates of a missing
 * owner surface NotFoundException. Surfaced from the OwnerServiceImpl uncovered-behaviour test-gaps
 * (no prior OwnerServiceImpl unit test existed).
 *
 * @validates F-019
 */
@ExtendWith(MockitoExtension.class)
class OwnerServiceImplTest {

    private static final long OWNER_ID = 1L;

    @Mock private ReactiveOwnerRepository ownerRepository;
    @Mock private ReactiveUserOwnerMappingRepository userOwnerMappingRepository;
    @Mock private ReactiveSearchEntrypointRepository searchEntrypointRepository;
    @Mock private ReactiveTermSearchEntrypointRepository termSearchEntrypointRepository;
    @Mock private ReactiveTermOwnershipRepository termOwnershipRepository;
    @Mock private ReactiveOwnershipRepository ownershipRepository;
    @Mock private ReactiveOwnerToRoleRepository ownerToRoleRepository;
    @Mock private OwnerMapper ownerMapper;

    private OwnerService service;

    @BeforeEach
    void setUp() {
        service = new OwnerServiceImpl(ownerRepository, userOwnerMappingRepository, searchEntrypointRepository,
            termSearchEntrypointRepository, termOwnershipRepository, ownershipRepository, ownerToRoleRepository,
            ownerMapper);
    }

    @Test
    void getOwnerDtoById_nonExistent_errorsNotFound() {
        when(ownerRepository.getDto(eq(OWNER_ID))).thenReturn(Mono.empty());
        StepVerifier.create(service.getOwnerDtoById(OWNER_ID)).verifyError(NotFoundException.class);
    }

    @Test
    void update_nonExistentOwner_errorsNotFoundWithoutWriting() {
        when(ownerRepository.get(eq(OWNER_ID))).thenReturn(Mono.empty());
        StepVerifier.create(service.update(OWNER_ID, new OwnerFormData().name("x")))
            .verifyError(NotFoundException.class);
        verify(ownerRepository, never()).update(any());
        verify(ownerToRoleRepository, never()).deleteOwnerRelationsExcept(anyLong(), any());
    }

    @Test
    void delete_ownerWithNoAttachedResources_clearsRolesThenDeletes() {
        when(termOwnershipRepository.existsByOwner(eq(OWNER_ID))).thenReturn(Mono.just(false));
        when(ownershipRepository.existsByOwner(eq(OWNER_ID))).thenReturn(Mono.just(false));
        when(userOwnerMappingRepository.isOwnerAssociated(eq(OWNER_ID))).thenReturn(Mono.just(false));
        when(ownerToRoleRepository.deleteOwnerRelationsExcept(eq(OWNER_ID), any())).thenReturn(Mono.empty());
        when(ownerRepository.delete(eq(OWNER_ID))).thenReturn(Mono.empty());

        StepVerifier.create(service.delete(OWNER_ID)).verifyComplete();

        verify(ownerToRoleRepository).deleteOwnerRelationsExcept(eq(OWNER_ID), eq(List.of()));
        verify(ownerRepository).delete(eq(OWNER_ID));
    }

    // delete() composes with .then(deleteRelations(...)).then(delete(...)) — the arg Monos are ASSEMBLED
    // eagerly, but the cascade-block error must short-circuit so they are never SUBSCRIBED. We stub them
    // with a poison Mono.error that fires only on subscription: if the cascade-blocked path wrongly
    // subscribed them, the chain would surface AssertionError instead of CascadeDeleteException and fail.
    private void poisonDeletePath() {
        when(ownerToRoleRepository.deleteOwnerRelationsExcept(anyLong(), any()))
            .thenReturn(Mono.error(new AssertionError("roles cleared despite cascade block")));
        when(ownerRepository.delete(anyLong()))
            .thenReturn(Mono.error(new AssertionError("owner deleted despite cascade block")));
    }

    @Test
    void delete_ownerWithExistingOwnership_errorsCascadeDeleteAndNeverDeletes() {
        when(termOwnershipRepository.existsByOwner(eq(OWNER_ID))).thenReturn(Mono.just(false));
        when(ownershipRepository.existsByOwner(eq(OWNER_ID))).thenReturn(Mono.just(true));
        when(userOwnerMappingRepository.isOwnerAssociated(eq(OWNER_ID))).thenReturn(Mono.just(false));
        poisonDeletePath();

        StepVerifier.create(service.delete(OWNER_ID)).verifyError(CascadeDeleteException.class);
    }

    @Test
    void delete_ownerAssociatedWithUser_errorsCascadeDeleteAndNeverDeletes() {
        when(termOwnershipRepository.existsByOwner(eq(OWNER_ID))).thenReturn(Mono.just(false));
        when(ownershipRepository.existsByOwner(eq(OWNER_ID))).thenReturn(Mono.just(false));
        when(userOwnerMappingRepository.isOwnerAssociated(eq(OWNER_ID))).thenReturn(Mono.just(true));
        poisonDeletePath();

        StepVerifier.create(service.delete(OWNER_ID)).verifyError(CascadeDeleteException.class);
    }
}
