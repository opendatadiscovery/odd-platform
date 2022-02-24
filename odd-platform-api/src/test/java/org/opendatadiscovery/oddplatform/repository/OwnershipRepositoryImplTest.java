package org.opendatadiscovery.oddplatform.repository;

import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
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
    void testCreateOwner() {
        final OwnerPojo owner = new OwnerPojo().setName(UUID.randomUUID().toString());
        final OwnerPojo savedOwner = ownerRepository.create(owner);
        final RolePojo role = new RolePojo().setName(UUID.randomUUID().toString());
        final RolePojo savedRole = roleRepository.create(role);

        final Long savedRoleId = savedRole.getId();
        final Long savedOwnerId = savedOwner.getId();
        final OwnershipPojo ownershipPojo = new OwnershipPojo()
            .setOwnerId(savedOwnerId).setRoleId(savedRoleId);

        final OwnershipPojo actualOwnership = ownershipRepository.create(ownershipPojo);

        assertThat(actualOwnership).isNotNull();
        assertThat(actualOwnership.getId()).isNotNull();
        assertThat(actualOwnership.getOwnerId()).isNotNull()
            .isEqualTo(savedOwnerId);
        assertThat(actualOwnership.getRoleId()).isNotNull()
            .isEqualTo(savedRoleId);
    }
}