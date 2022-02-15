package org.opendatadiscovery.oddplatform.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("Integration tests for RoleRepository")
class RolesRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private RoleRepository roleRepository;

    @Test
    @DisplayName("Creates role pojo, expecting role pojo in db")
    void testCreatesRolePojo() {
        final RolePojo rolePojo = new RolePojo().setName(UUID.randomUUID().toString());

        final RolePojo actualRolePojo = roleRepository.create(rolePojo);

        assertNotNull(actualRolePojo);
        assertNotNull(actualRolePojo.getId());
        assertNotNull(actualRolePojo.getName());
    }

    @Test
    @DisplayName("Creates role if role doesn't exist, expecting created role in db")
    void testCreateOrGetRolePojo_NewRole() {
        final RolePojo rolePojo = new RolePojo().setName(UUID.randomUUID().toString());

        final RolePojo actualRolePojo = roleRepository.createOrGet(rolePojo);
        assertNotNull(actualRolePojo);
        assertNotNull(actualRolePojo.getId());
        assertNotNull(actualRolePojo.getName());
    }

    @Test
    @DisplayName("Gets role if role exists, expecting gets already created role")
    void testCreateOrGetRolePojo_ExistedRole() {
        final RolePojo rolePojo = new RolePojo().setName(UUID.randomUUID().toString());

        final RolePojo savedRole = roleRepository.create(rolePojo);
        final RolePojo actualRolePojo = roleRepository.createOrGet(rolePojo);

        assertNotNull(actualRolePojo);
        assertNotNull(actualRolePojo.getId());
        assertNotNull(actualRolePojo.getName());
        assertEquals(savedRole.getId(), actualRolePojo.getId());
    }

    /**
     * Test case: Bulk creation of roles
     * Expected result: 1. All saved roles have ids 2. Saved roles have same names as input bunch of roles
     */
    @Test
    @DisplayName("Bulk creation roles, expecting roles are created successfully")
    void testBulkCreateRole() {
        final int numberOfTestRoles = 3;
        final List<RolePojo> testRoleList = createTestRoleList(numberOfTestRoles);
        final List<String> testRoleListNames = getListNames(testRoleList);

        final List<RolePojo> actualRoleList = roleRepository.bulkCreate(testRoleList);
        assertFalse(actualRoleList.isEmpty());
        actualRoleList.forEach(r -> assertNotNull(r.getId()));

        assertTrue(testRoleListNames.containsAll(getListNames(actualRoleList)));
    }

    /**
     * Test case: Bulk update of roles
     * Expected result: 1. All saved roles have ids 2. Saved roles have same names as input bunch of roles
     */
    @Test
    @DisplayName("Bulk update roles, expecting roles are updated successfully")
    void testBulkUpdateRole() {
        final int numberOfTestRoles = 3;
        final List<RolePojo> testRoleList = createTestRoleList(numberOfTestRoles);
        final List<String> testRoleListNames = getListNames(testRoleList);

        //create roles
        final List<RolePojo> savedRoleList = roleRepository.bulkCreate(testRoleList);
        assertFalse(savedRoleList.isEmpty());
        savedRoleList.forEach(r -> assertNotNull(r.getId()));
        assertTrue(testRoleListNames.containsAll(getListNames(savedRoleList)));

        //updated roles
        for (final RolePojo rolePojo : savedRoleList) {
            rolePojo.setName(UUID.randomUUID().toString());
        }
        final List<String> newRoleListNames = getListNames(savedRoleList);
        final List<RolePojo> updatedRoleList = roleRepository.bulkUpdate(savedRoleList);

        assertFalse(updatedRoleList.isEmpty());
        updatedRoleList.forEach(r -> {
            assertNotNull(r.getId());
            assertNotNull(r.getName());
        });
        assertTrue(newRoleListNames.containsAll(getListNames(updatedRoleList)));
    }

    @Test
    @DisplayName("Updates role pojo, expecting updated role pojo in db")
    void testUpdatesRolePojo() {
        final String initialRoleName = UUID.randomUUID().toString();
        final RolePojo rolePojo = new RolePojo().setName(initialRoleName);

        final RolePojo savedRole = roleRepository.create(rolePojo);
        assertNotNull(savedRole);
        assertNotNull(savedRole.getId());
        assertEquals(initialRoleName, savedRole.getName());

        final String newRoleName = UUID.randomUUID().toString();
        savedRole.setName(newRoleName);
        final RolePojo updatedRole = roleRepository.update(savedRole);

        assertNotNull(updatedRole);
        assertNotNull(updatedRole.getId());
        assertEquals(newRoleName, updatedRole.getName());
    }

    @Test
    @DisplayName("Deletes role pojo, expecting no role pojo in db")
    void testDeletesRolePojo() {
        final RolePojo rolePojo = new RolePojo().setName(UUID.randomUUID().toString());

        final RolePojo actualRolePojo = roleRepository.create(rolePojo);
        assertNotNull(actualRolePojo);
        final Long actualRolePojoId = actualRolePojo.getId();
        assertNotNull(actualRolePojoId);
        assertNotNull(actualRolePojo.getName());

        roleRepository.delete(actualRolePojoId);
        final Optional<RolePojo> deletedRole = roleRepository.get(actualRolePojoId);
        assertFalse(deletedRole.isPresent());
    }

    @Test
    @DisplayName("Gets by name role from db, expecting role extracted successfully")
    void testGetByNameRole() {
        final String testRoleName = UUID.randomUUID().toString();
        final RolePojo rolePojo = new RolePojo().setName(testRoleName);

        roleRepository.create(rolePojo);

        final Optional<RolePojo> actualRole = roleRepository.getByName(testRoleName);

        assertTrue(actualRole.isPresent());
        final RolePojo actualRolePojo = actualRole.get();
        assertNotNull(actualRolePojo.getId());
        final String actualRolePojoName = actualRolePojo.getName();
        assertNotNull(actualRolePojoName);
        assertEquals(testRoleName, actualRolePojoName);
    }

    /**
     * Method for the test purpose. Creates list of exact number of {@link RolePojo}
     *
     * @param numberOfTestRoles - number of roles inside the list
     * @return - List of {@link RolePojo}
     */
    @NotNull
    private List<RolePojo> createTestRoleList(final int numberOfTestRoles) {
        final List<RolePojo> testRolePojo = new ArrayList<>();
        for (int i = 0; i < numberOfTestRoles; i++) {
            testRolePojo.add(new RolePojo()
                .setName(UUID.randomUUID().toString()));
        }
        return testRolePojo;
    }

    private List<String> getListNames(final List<RolePojo> testRoleList) {
        return testRoleList.stream().map(RolePojo::getName).toList();
    }
}
