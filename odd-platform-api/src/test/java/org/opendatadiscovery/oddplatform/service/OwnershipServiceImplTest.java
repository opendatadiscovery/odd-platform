package org.opendatadiscovery.oddplatform.service;

import java.util.UUID;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.Owner;
import org.opendatadiscovery.oddplatform.api.contract.model.Ownership;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnershipFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnershipUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.Role;
import org.opendatadiscovery.oddplatform.dto.OwnershipDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.OwnershipMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnershipRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.only;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link OwnershipService}.
 *
 * @author matmalik on 25.02.2022
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Ownership service unit tests")
class OwnershipServiceImplTest {

    //class to be tested
    private OwnershipService ownershipService;

    //mocks
    @Mock
    private RoleService roleService;
    @Mock
    private OwnerService ownerService;
    @Mock
    private ReactiveOwnershipRepository ownershipRepository;
    @Mock
    private ReactiveSearchEntrypointRepository searchEntrypointRepository;
    @Mock
    private OwnershipMapper ownershipMapper;

    @BeforeEach
    void setUp() {
        ownershipService = new OwnershipServiceImpl(roleService, ownerService, ownershipRepository,
            searchEntrypointRepository, ownershipMapper);
    }

    @Test
    @DisplayName("Creates ownership, expecting successfully created")
    void testCreateOwnership() {
        final String testOwnerName = UUID.randomUUID().toString();
        final String testRoleName = UUID.randomUUID().toString();
        final long testOwnerId = 2L;
        final long testRoleId = 3L;
        final long testOwnershipId = 15L;

        final OwnershipFormData testOwnershipFromData = new OwnershipFormData()
            .ownerName(testOwnerName)
            .roleName(testRoleName);
        final OwnerPojo owner = createTestOwner(testOwnerId, testOwnerName);
        final RolePojo role = createTestRole(testRoleId, testRoleName);
        final OwnershipPojo ownershipPojo = createTestOwnershipPojo(testOwnershipId, owner, role);
        final Ownership ownership = createTestOwnership(testOwnershipId, owner, role);

        when(ownerService.getOrCreate(anyString())).thenReturn(Mono.just(owner));
        when(roleService.getOrCreate(anyString())).thenReturn(Mono.just(role));
        when(ownershipRepository.create(any(OwnershipPojo.class))).thenReturn(Mono.just(ownershipPojo));
        when(searchEntrypointRepository.updateChangedOwnershipVectors(anyLong())).thenReturn(Mono.just(1));
        when(ownershipMapper.mapDto(any(OwnershipDto.class))).thenReturn(ownership);

        final Mono<Ownership> actualOwnershipMono = ownershipService.create(1L, testOwnershipFromData);

        StepVerifier
            .create(actualOwnershipMono)
            .assertNext(o -> {
                assertThat(o.getId()).isEqualTo(testOwnershipId);
                assertThat(o.getOwner().getId()).isEqualTo(testOwnerId);
                assertThat(o.getOwner().getName()).isEqualTo(testOwnerName);
                assertThat(o.getRole().getId()).isEqualTo(testRoleId);
                assertThat(o.getRole().getName()).isEqualTo(testRoleName);
            })
            .verifyComplete();
        verify(ownerService, only()).getOrCreate(any(String.class));
        verify(roleService, only()).getOrCreate(any(String.class));
        verify(ownershipRepository, times(1)).create(any(OwnershipPojo.class));
        verify(searchEntrypointRepository, times(1))
            .updateChangedOwnershipVectors(testOwnershipId);
        verify(ownershipMapper, only()).mapDto(any(OwnershipDto.class));
    }

    @Test
    @DisplayName("Updates ownership, expecting successfully updated")
    void testUpdateOwnership() {
        final String testOwnerName = UUID.randomUUID().toString();
        final String testRoleName = UUID.randomUUID().toString();
        final long testOwnerId = 2L;
        final long testRoleId = 3L;
        final long testOwnershipId = 15L;

        final OwnershipUpdateFormData ownershipUpdateFormData = new OwnershipUpdateFormData();
        ownershipUpdateFormData.setRoleName(testRoleName);
        final OwnershipPojo testOwnershipPojo = new OwnershipPojo();
        testOwnershipPojo.setId(testOwnershipId);
        final OwnerPojo owner = createTestOwner(testOwnerId, testOwnerName);
        final RolePojo role = createTestRole(testRoleId, testRoleName);
        final Ownership ownership = createTestOwnership(testOwnershipId, owner, role);
        final RolePojo rolePojo = new RolePojo();
        rolePojo.setId(testRoleId);

        when(ownershipRepository.get(testOwnershipId)).thenReturn(Mono.just(new OwnershipDto()));
        when(roleService.getOrCreate(any(String.class))).thenReturn(Mono.just(rolePojo));
        when(ownershipRepository.updateRole(testOwnershipId, testRoleId)).thenReturn(Mono.just(testOwnershipPojo));
        when(searchEntrypointRepository.updateChangedOwnershipVectors(anyLong())).thenReturn(Mono.just(1));
        when(ownershipMapper.mapDto(any(OwnershipDto.class))).thenReturn(ownership);

        final Mono<Ownership> actualOwnershipMono = ownershipService.update(testOwnershipId, ownershipUpdateFormData);

        StepVerifier
            .create(actualOwnershipMono)
            .assertNext(o -> {
                assertThat(o.getId()).isEqualTo(testOwnershipId);
                assertThat(o.getOwner().getId()).isEqualTo(testOwnerId);
                assertThat(o.getOwner().getName()).isEqualTo(testOwnerName);
                assertThat(o.getRole().getId()).isEqualTo(testRoleId);
                assertThat(o.getRole().getName()).isEqualTo(testRoleName);
            })
            .verifyComplete();
        verify(ownershipRepository, times(1)).updateRole(testOwnershipId, testRoleId);
        verify(ownershipRepository, times(2)).get(testOwnershipId);
        verify(searchEntrypointRepository, times(1))
            .updateChangedOwnershipVectors(testOwnershipId);
        verify(ownershipMapper, only()).mapDto(any(OwnershipDto.class));
        verify(roleService, only()).getOrCreate(any(String.class));
    }

    /**
     * Method for the testing purposes. Creates test {@link Ownership}
     *
     * @param ownershipId - ownershipId
     * @param owner       - owner
     * @param role        - role
     * @return {@link Ownership}
     */
    @NotNull
    private Ownership createTestOwnership(final long ownershipId, final OwnerPojo owner, final RolePojo role) {
        final Ownership ownership = new Ownership();
        ownership.setId(ownershipId);
        ownership.setOwner(new Owner().id(owner.getId()).name(owner.getName()));
        ownership.setRole(new Role().id(role.getId()).name(role.getName()));
        return ownership;
    }

    /**
     * Method for the testing purposes. Creates test {@link OwnershipPojo}
     *
     * @param ownershipId - ownershipId
     * @param owner       - owner
     * @param role        - role
     * @return {@link OwnershipPojo}
     */
    @NotNull
    private OwnershipPojo createTestOwnershipPojo(final long ownershipId, final OwnerPojo owner, final RolePojo role) {
        final OwnershipPojo ownershipPojo = new OwnershipPojo();
        ownershipPojo.setId(ownershipId);
        ownershipPojo.setOwnerId(owner.getId());
        ownershipPojo.setRoleId(role.getId());
        return ownershipPojo;
    }

    /**
     * Method for the testing purposes. Creates test {@link Owner}
     *
     * @param ownerId   - ownerId
     * @param ownerName - ownerName
     * @return {@link Owner}
     */
    @NotNull
    private OwnerPojo createTestOwner(final long ownerId, final String ownerName) {
        final OwnerPojo owner = new OwnerPojo();
        owner.setId(ownerId);
        owner.setName(ownerName);
        return owner;
    }

    /**
     * Method for the testing purposes. Creates test {@link Role}
     *
     * @param roleId   - roleId
     * @param roleName - roleName
     * @return {@link Role}
     */
    @NotNull
    private RolePojo createTestRole(final long roleId, final String roleName) {
        final RolePojo role = new RolePojo();
        role.setId(roleId);
        role.setName(roleName);
        return role;
    }
}