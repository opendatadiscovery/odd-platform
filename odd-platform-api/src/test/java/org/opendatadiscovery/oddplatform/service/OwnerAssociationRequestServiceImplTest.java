package org.opendatadiscovery.oddplatform.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatus;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.OwnerAssociationRequestMapper;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerAssociationRequestRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerRepository;
import org.opendatadiscovery.oddplatform.service.permission.PermissionService;
import org.opendatadiscovery.oddplatform.utils.ProviderUtils;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for owner-association triage — validates F-171 (Operator-Facing Owner-Association
 * Triage Workflow): approving/declining a request id that does not exist errors NotFound. Exercised with
 * Mockito + StepVerifier. getCurrentUser() is assembled into the chain head (eager) but the missing
 * request short-circuits before it is subscribed, so it is stubbed (not subscribed). No prior
 * OwnerAssociationRequestServiceImpl unit test.
 *
 * @validates F-171
 */
@ExtendWith(MockitoExtension.class)
class OwnerAssociationRequestServiceImplTest {

    @Mock private OwnerService ownerService;
    @Mock private ReactiveOwnerRepository ownerRepository;
    @Mock private ReactiveOwnerAssociationRequestRepository ownerAssociationRequestRepository;
    @Mock private AuthIdentityProvider authIdentityProvider;
    @Mock private UserOwnerMappingService userOwnerMappingService;
    @Mock private OwnerAssociationRequestActivityService activityService;
    @Mock private PermissionService permissionService;
    @Mock private OwnerAssociationRequestMapper mapper;
    @Mock private ProviderUtils providerUtils;

    private OwnerAssociationRequestService service;

    @BeforeEach
    void setUp() {
        service = new OwnerAssociationRequestServiceImpl(ownerService, ownerRepository,
            ownerAssociationRequestRepository, authIdentityProvider, userOwnerMappingService, activityService,
            permissionService, mapper, providerUtils);
    }

    @Test
    void updateOwnerAssociationRequest_nonExistentRequest_errorsNotFound() {
        when(authIdentityProvider.getCurrentUser()).thenReturn(Mono.empty());
        when(ownerAssociationRequestRepository.getDto(anyLong())).thenReturn(Mono.empty());
        StepVerifier.create(service.updateOwnerAssociationRequest(1L, OwnerAssociationRequestStatus.APPROVED))
            .verifyError(NotFoundException.class);
    }
}
