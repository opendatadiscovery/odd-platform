package org.opendatadiscovery.oddplatform.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Integration tests for RoleRepository")
class RolesRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private ReactiveRoleRepository roleRepository;

    @Test
    @DisplayName("Creates role pojo, expecting role pojo in db")
    void testCreatesRolePojo() {
        final RolePojo rolePojo = new RolePojo().setName(UUID.randomUUID().toString());

        roleRepository.create(rolePojo)
            .as(StepVerifier::create)
            .assertNext(actualRolePojo -> {
                assertThat(actualRolePojo).isNotNull();
                assertThat(actualRolePojo.getId()).isNotNull();
                assertThat(actualRolePojo.getName()).isNotNull()
                    .isEqualTo(rolePojo.getName());
            }).verifyComplete();
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

        roleRepository.bulkCreate(testRoleList)
            .collectList()
            .as(StepVerifier::create)
            .assertNext(actualRoleList -> {
                assertThat(actualRoleList)
                    .isNotEmpty()
                    .extracting(RolePojo::getId).doesNotContainNull();
                assertThat(actualRoleList)
                    .extracting(RolePojo::getName)
                    .containsExactlyInAnyOrder(testRoleListNames.toArray(String[]::new));
            }).verifyComplete();
    }

    /**
     * Test case: Bulk update of roles
     * Expected result: 1. All saved roles have ids 2. Saved roles have same names as input bunch of roles
     */
    @Test
    @DisplayName("Bulk update roles, expecting roles are updated successfully")
    void testBulkUpdateRole() {
        final int numberOfTestRoles = 4;
        final List<RolePojo> testRoleList = createTestRoleList(numberOfTestRoles);
        final List<String> testRoleListNames = getListNames(testRoleList);

        //create roles
        final List<RolePojo> savedRoleList = roleRepository.bulkCreate(testRoleList)
            .collectList()
            .block();
        assertThat(savedRoleList).isNotEmpty()
            .extracting(RolePojo::getId).doesNotContainNull();
        assertThat(savedRoleList)
            .extracting(RolePojo::getName).containsAll(testRoleListNames);

        //update roles
        for (final RolePojo rolePojo : savedRoleList) {
            rolePojo.setName(UUID.randomUUID().toString());
        }
        final List<String> newRoleListNames = getListNames(savedRoleList);
        roleRepository.bulkUpdate(savedRoleList)
            .collectList()
            .as(StepVerifier::create)
            .assertNext(updatedRoleList -> {
                assertThat(updatedRoleList).isNotEmpty()
                    .flatExtracting(RolePojo::getId, RolePojo::getName).doesNotContainNull();
                assertThat(updatedRoleList)
                    .extracting(RolePojo::getName).isEqualTo(newRoleListNames);
            }).verifyComplete();
    }

    @Test
    @DisplayName("Updates role pojo, expecting updated role pojo in db")
    void testUpdatesRolePojo() {
        final String initialRoleName = UUID.randomUUID().toString();
        final RolePojo rolePojo = new RolePojo().setName(initialRoleName);

        final RolePojo savedRole = roleRepository.create(rolePojo).block();
        assertThat(savedRole).isNotNull();
        assertThat(savedRole.getId()).isNotNull();
        assertThat(savedRole.getName()).isNotNull()
            .isEqualTo(initialRoleName);
        final String newRoleName = UUID.randomUUID().toString();
        savedRole.setName(newRoleName);

        roleRepository.update(savedRole)
            .as(StepVerifier::create)
            .assertNext(updatedRole -> {
                assertThat(updatedRole).isNotNull();
                assertThat(updatedRole.getId()).isNotNull();
                assertThat(updatedRole.getName()).isNotNull()
                    .isEqualTo(newRoleName);
            }).verifyComplete();
    }

    @Test
    @DisplayName("Deletes role pojo, expecting no role pojo in db")
    void testDeletesRolePojo() {
        final RolePojo rolePojo = new RolePojo().setName(UUID.randomUUID().toString());

        final RolePojo actualRolePojo = roleRepository.create(rolePojo).block();
        assertThat(actualRolePojo).isNotNull();
        final Long actualRolePojoId = actualRolePojo.getId();
        assertThat(actualRolePojoId).isNotNull();
        assertThat(actualRolePojo.getName()).isNotNull();

        roleRepository.delete(actualRolePojoId).block();
        roleRepository.get(actualRolePojoId)
            .as(StepVerifier::create)
            .verifyComplete();
    }

    @Test
    @DisplayName("Gets by name role from db, expecting role extracted successfully")
    void testGetByNameRole() {
        final String testRoleName = UUID.randomUUID().toString();
        final RolePojo rolePojo = new RolePojo().setName(testRoleName);

        roleRepository.create(rolePojo).block();

        roleRepository.getByName(testRoleName)
            .as(StepVerifier::create)
            .assertNext(actualRole -> {
                assertThat(actualRole.getId()).isNotNull();
                assertThat(actualRole.getName()).isNotNull()
                    .isEqualTo(testRoleName);
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("Gets by name role which is not in db, expecting no role extracted")
    void testGetByNameRole_DifferentName() {
        final String testRoleName = UUID.randomUUID().toString();
        final RolePojo rolePojo = new RolePojo().setName(testRoleName);

        roleRepository.create(rolePojo).block();

        roleRepository.getByName(UUID.randomUUID().toString())
            .as(StepVerifier::create)
            .verifyComplete();
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
