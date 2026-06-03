package org.opendatadiscovery.oddplatform.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleFormData;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.security.UserProviderRole;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.RoleMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerToRoleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveRoleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveRoleToPolicyRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveUserOwnerMappingRepository;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for the Role lifecycle — validates F-006 (Role-Based Access Control), focusing on
 * the predefined-role protection invariant and not-found paths: the ADMIN role is NOT editable
 * (BadUserRequest), a predefined role (ADMIN/USER/...) cannot be deleted (BadUserRequest), and
 * update/delete of a missing role error NotFoundException. Exercised with Mockito + StepVerifier.
 * delete() composes via eager .then(arg) (isRoleAttachedToOwner / deleteRoleRelationsExcept / delete), so
 * those are stubbed with subscribe-only poison Monos proving the guard short-circuits before any mutation.
 * No prior RoleServiceImpl unit test existed (TEST-GAP-221).
 *
 * @validates F-006
 */
@ExtendWith(MockitoExtension.class)
class RoleServiceImplTest {

    private static final long ROLE_ID = 1L;

    @Mock private RoleMapper roleMapper;
    @Mock private ReactiveRoleRepository roleRepository;
    @Mock private ReactiveRoleToPolicyRepository roleToPolicyRepository;
    @Mock private ReactiveOwnerToRoleRepository ownerToRoleRepository;
    @Mock private AuthIdentityProvider authIdentityProvider;
    @Mock private ReactiveUserOwnerMappingRepository userOwnerMappingRepository;

    private RoleService service;

    @BeforeEach
    void setUp() {
        service = new RoleServiceImpl(roleMapper, roleRepository, roleToPolicyRepository, ownerToRoleRepository,
            authIdentityProvider, userOwnerMappingRepository);
    }

    // delete() eagerly assembles .then(isRoleAttachedToOwner).then(deleteRoleRelationsExcept).then(delete);
    // these poison Monos fire only on subscription, proving the predefined/not-found guard short-circuits
    // before any of them is subscribed.
    private void poisonDeleteTail() {
        when(ownerToRoleRepository.isRoleAttachedToOwner(anyLong()))
            .thenReturn(Mono.error(new AssertionError("checked owner-attachment despite an earlier guard")));
        when(roleToPolicyRepository.deleteRoleRelationsExcept(anyLong(), any()))
            .thenReturn(Mono.error(new AssertionError("cleared role policies despite an earlier guard")));
        when(roleRepository.delete(anyLong()))
            .thenReturn(Mono.error(new AssertionError("deleted role despite an earlier guard")));
    }

    @Test
    void update_nonExistentRole_errorsNotFound() {
        when(roleRepository.get(eq(ROLE_ID))).thenReturn(Mono.empty());
        StepVerifier.create(service.update(ROLE_ID, new RoleFormData().name("x")))
            .verifyError(NotFoundException.class);
    }

    @Test
    void update_adminRole_errorsBadRequestNotEditable() {
        when(roleRepository.get(eq(ROLE_ID)))
            .thenReturn(Mono.just(new RolePojo().setName(UserProviderRole.ADMIN.getValue())));
        StepVerifier.create(service.update(ROLE_ID, new RoleFormData().name("renamed")))
            .verifyError(BadUserRequestException.class);
    }

    @Test
    void delete_predefinedRole_errorsBadRequestCannotDelete() {
        when(roleRepository.get(eq(ROLE_ID)))
            .thenReturn(Mono.just(new RolePojo().setName(UserProviderRole.ADMIN.getValue())));
        poisonDeleteTail();
        StepVerifier.create(service.delete(ROLE_ID)).verifyError(BadUserRequestException.class);
    }

    @Test
    void delete_nonExistentRole_errorsNotFound() {
        when(roleRepository.get(eq(ROLE_ID))).thenReturn(Mono.empty());
        poisonDeleteTail();
        StepVerifier.create(service.delete(ROLE_ID)).verifyError(NotFoundException.class);
    }
}
