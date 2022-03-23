package org.opendatadiscovery.oddplatform.repository;

import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.dto.OwnershipDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@DisplayName("Integration tests for OwnershipRepository")
class OwnershipRepositoryImplTest extends BaseIntegrationTest {

    //repo to be tested
    @Autowired
    private OwnershipRepository ownershipRepository;

    //additional repo
    @Autowired
    private OwnerRepository ownerRepository;
    @Autowired
    private RoleRepository roleRepository;

    @Test
    @DisplayName("Creates new ownership, expecting ownership in db")
    void testCreateOwnership() {
        //given
        final String ownerName = UUID.randomUUID().toString();
        final OwnerPojo savedOwner = ownerRepository.create(new OwnerPojo().setName(ownerName));
        final Long savedOwnerId = savedOwner.getId();

        final String roleName = UUID.randomUUID().toString();
        final RolePojo savedRole = roleRepository.create(new RolePojo().setName(roleName));
        final Long savedRoleId = savedRole.getId();

        final OwnershipPojo ownershipPojo = new OwnershipPojo()
            .setOwnerId(savedOwnerId).setRoleId(savedRoleId);

        //when
        final OwnershipPojo actualOwnership = ownershipRepository.create(ownershipPojo);

        //then
        assertOwnership(savedRoleId, savedOwnerId, actualOwnership);
    }

    @Test
    @DisplayName("Gets created ownership from db, expecting ownership retrieved from db")
    void testGetOwnership() {
        //given
        final String ownerName = UUID.randomUUID().toString();
        final OwnerPojo savedOwner = ownerRepository.create(new OwnerPojo().setName(ownerName));
        final Long savedOwnerId = savedOwner.getId();

        final String roleName = UUID.randomUUID().toString();
        final RolePojo savedRole = roleRepository.create(new RolePojo().setName(roleName));
        final Long savedRoleId = savedRole.getId();

        final OwnershipPojo testOwnership = new OwnershipPojo()
            .setOwnerId(savedOwnerId).setRoleId(savedRoleId);
        final OwnershipPojo createdOwnership = ownershipRepository.create(testOwnership);

        //when
        final OwnershipDto actualOwnershipDto = ownershipRepository.get(createdOwnership.getId());

        //then
        assertThat(actualOwnershipDto).isNotNull();
        final OwnershipPojo actualOwnershipPojo = actualOwnershipDto.getOwnership();
        assertOwnership(savedRoleId, savedOwnerId, actualOwnershipPojo);
        assertOwnerAndRole(ownerName, savedOwnerId, roleName, savedRoleId, actualOwnershipDto);
    }

    @Test
    @DisplayName("Updates ownership role, expecting ownership role updated")
    void testUpdateRoleOwnership() {
        //given
        final String ownerName = UUID.randomUUID().toString();
        final OwnerPojo savedOwner = ownerRepository.create(new OwnerPojo().setName(ownerName));
        final Long savedOwnerId = savedOwner.getId();

        final String roleName = UUID.randomUUID().toString();
        final RolePojo savedRole = roleRepository.create(new RolePojo().setName(roleName));
        final Long savedRoleId = savedRole.getId();

        final OwnershipPojo testOwnership = new OwnershipPojo()
            .setOwnerId(savedOwnerId).setRoleId(savedRoleId);
        final OwnershipPojo createdOwnership = ownershipRepository.create(testOwnership);
        assertThat(createdOwnership).isNotNull();
        assertThat(createdOwnership.getRoleId()).isEqualTo(savedRoleId);

        //new role for update
        final String newRoleName = UUID.randomUUID().toString();
        final RolePojo newSavedRole = roleRepository.create(new RolePojo().setName(newRoleName));
        final Long newSavedRoleId = newSavedRole.getId();

        //when
        final OwnershipPojo actualOwnershipPojo = ownershipRepository.updateRole(
            createdOwnership.getId(), newSavedRoleId);

        //then
        assertThat(actualOwnershipPojo).isNotNull();
        assertOwnership(newSavedRoleId, savedOwnerId, actualOwnershipPojo);
        final OwnershipDto actualOwnershipDto = ownershipRepository.get(actualOwnershipPojo.getId());
        assertOwnerAndRole(ownerName, savedOwnerId, newRoleName, newSavedRoleId, actualOwnershipDto);
    }

    @Test
    @DisplayName("Deletes existing ownership, expecting ownership is deleted from db")
    void testDeleteOwnership() {
        //given
        final String ownerName = UUID.randomUUID().toString();
        final OwnerPojo savedOwner = ownerRepository.create(new OwnerPojo().setName(ownerName));
        final Long savedOwnerId = savedOwner.getId();

        final String roleName = UUID.randomUUID().toString();
        final RolePojo savedRole = roleRepository.create(new RolePojo().setName(roleName));
        final Long savedRoleId = savedRole.getId();

        final OwnershipPojo testOwnership = new OwnershipPojo()
            .setOwnerId(savedOwnerId).setRoleId(savedRoleId);
        final OwnershipPojo createdOwnership = ownershipRepository.create(testOwnership);
        final Long createdOwnershipId = createdOwnership.getId();

        //when
        ownershipRepository.delete(createdOwnershipId);

        //then
        final OwnershipDto actualOwnershipDto = ownershipRepository.get(createdOwnershipId);
        assertThat(actualOwnershipDto).isNull();
    }

    private void assertOwnerAndRole(final String ownerName, final Long savedOwnerId, final String newRoleName,
                                    final Long newSavedRoleId, final OwnershipDto actualOwnershipDto) {
        final OwnerPojo actualOwner = actualOwnershipDto.getOwner();
        assertThat(actualOwner).isNotNull();
        assertThat(actualOwner.getName()).isNotNull().isEqualTo(ownerName);
        assertThat(actualOwner.getId()).isNotNull().isEqualTo(savedOwnerId);

        final RolePojo actualRole = actualOwnershipDto.getRole();
        assertThat(actualRole).isNotNull();
        assertThat(actualRole.getName()).isNotNull().isEqualTo(newRoleName);
        assertThat(actualRole.getId()).isNotNull().isEqualTo(newSavedRoleId);
    }

    private void assertOwnership(final Long savedRoleId, final Long savedOwnerId, final OwnershipPojo actualOwnership) {
        assertThat(actualOwnership).isNotNull();
        assertThat(actualOwnership.getId()).isNotNull();
        assertThat(actualOwnership.getOwnerId()).isNotNull().isEqualTo(savedOwnerId);
        assertThat(actualOwnership.getRoleId()).isNotNull().isEqualTo(savedRoleId);
    }
}