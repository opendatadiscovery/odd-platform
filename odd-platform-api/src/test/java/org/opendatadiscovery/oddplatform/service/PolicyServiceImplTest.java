package org.opendatadiscovery.oddplatform.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.PolicyFormData;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.PolicyMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.PolicyPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactivePolicyRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveRoleToPolicyRepository;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for the Policy lifecycle — validates F-006 (Role-Based Access Control): the
 * "Administrator" policy is protected (update AND delete error BadUserRequest), and read/update/delete of
 * a missing policy error NotFoundException. Exercised with Mockito + StepVerifier. delete() composes via
 * eager .then(isPolicyAttachedToRole / delete), so those are poison-stubbed (subscribe-only) to prove the
 * guard short-circuits before any mutation. No prior PolicyServiceImpl unit test.
 *
 * @validates F-006
 */
@ExtendWith(MockitoExtension.class)
class PolicyServiceImplTest {

    private static final long POLICY_ID = 1L;
    private static final String ADMINISTRATOR_POLICY = "Administrator";

    @Mock private ReactivePolicyRepository policyRepository;
    @Mock private ReactiveRoleToPolicyRepository roleToPolicyRepository;
    @Mock private PolicyJSONValidator policyJSONValidator;
    @Mock private PolicyMapper policyMapper;
    @Mock private RoleService roleService;

    private PolicyService service;

    @BeforeEach
    void setUp() {
        service = new PolicyServiceImpl(policyRepository, roleToPolicyRepository, policyJSONValidator,
            policyMapper, roleService);
    }

    private void poisonDeleteTail() {
        when(roleToPolicyRepository.isPolicyAttachedToRole(anyLong()))
            .thenReturn(Mono.error(new AssertionError("checked role-attachment despite an earlier guard")));
        when(policyRepository.delete(anyLong()))
            .thenReturn(Mono.error(new AssertionError("deleted policy despite an earlier guard")));
    }

    @Test
    void getPolicyDetails_nonExistent_errorsNotFound() {
        when(policyRepository.get(eq(POLICY_ID))).thenReturn(Mono.empty());
        StepVerifier.create(service.getPolicyDetails(POLICY_ID)).verifyError(NotFoundException.class);
    }

    @Test
    void update_nonExistentPolicy_errorsNotFound() {
        when(policyRepository.get(eq(POLICY_ID))).thenReturn(Mono.empty());
        StepVerifier.create(service.update(POLICY_ID, new PolicyFormData())).verifyError(NotFoundException.class);
    }

    @Test
    void update_administratorPolicy_errorsBadRequestNotEditable() {
        when(policyRepository.get(eq(POLICY_ID)))
            .thenReturn(Mono.just(new PolicyPojo().setName(ADMINISTRATOR_POLICY)));
        StepVerifier.create(service.update(POLICY_ID, new PolicyFormData()))
            .verifyError(BadUserRequestException.class);
    }

    @Test
    void delete_administratorPolicy_errorsBadRequestNotDeletable() {
        when(policyRepository.get(eq(POLICY_ID)))
            .thenReturn(Mono.just(new PolicyPojo().setName(ADMINISTRATOR_POLICY)));
        poisonDeleteTail();
        StepVerifier.create(service.delete(POLICY_ID)).verifyError(BadUserRequestException.class);
    }

    @Test
    void delete_nonExistentPolicy_errorsNotFound() {
        when(policyRepository.get(eq(POLICY_ID))).thenReturn(Mono.empty());
        poisonDeleteTail();
        StepVerifier.create(service.delete(POLICY_ID)).verifyError(NotFoundException.class);
    }
}
