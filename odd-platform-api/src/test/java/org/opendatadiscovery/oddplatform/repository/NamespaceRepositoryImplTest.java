package org.opendatadiscovery.oddplatform.repository;

import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveNamespaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

class NamespaceRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private ReactiveNamespaceRepository namespaceRepository;

    @Test
    @DisplayName("Test creates namespace pojo, expecting namespace pojo in the database")
    void testCreate() {
        final NamespacePojo namespacePojo = new NamespacePojo()
            .setName(UUID.randomUUID().toString());

        final NamespacePojo createdNamespace = namespaceRepository.create(namespacePojo)
            .blockOptional()
            .orElseThrow();
        namespaceRepository.get(createdNamespace.getId())
            .as(StepVerifier::create)
            .assertNext(pojo -> assertThat(pojo).isEqualTo(createdNamespace))
            .verifyComplete();
    }

    @Test
    @DisplayName("Test creates namespace pojo by its name, expecting namespace pojo in the database")
    void testCreateByName() {
        final String name = UUID.randomUUID().toString();

        final NamespacePojo createdNamespace = namespaceRepository.createByName(name)
            .blockOptional()
            .orElseThrow();
        namespaceRepository.get(createdNamespace.getId())
            .as(StepVerifier::create)
            .assertNext(pojo -> assertThat(pojo).isEqualTo(createdNamespace))
            .verifyComplete();
    }

    @Test
    @DisplayName("Test softly deletes namespace pojo from db, expecting no record in the database")
    void testDelete() {
        final NamespacePojo pojo = new NamespacePojo()
            .setName(UUID.randomUUID().toString());

        namespaceRepository.create(pojo)
            .map(NamespacePojo::getId)
            .flatMap(namespaceRepository::delete)
            .map(NamespacePojo::getId)
            .flatMap(namespaceRepository::get)
            .as(StepVerifier::create)
            .verifyComplete();
    }

    @Test
    @DisplayName("Test updates namespace pojo, expecting updated namespace pojo in the database")
    void testUpdate() {
        final NamespacePojo pojo = new NamespacePojo()
            .setName(UUID.randomUUID().toString());

        final String newName = UUID.randomUUID().toString();

        final NamespacePojo createdNamespace = namespaceRepository.create(pojo).blockOptional()
            .orElseThrow();

        namespaceRepository.update(new NamespacePojo(createdNamespace).setName(newName))
            .as(StepVerifier::create)
            .assertNext(updatedPojo -> {
                assertThat(updatedPojo.getId()).isEqualTo(createdNamespace.getId());
                assertThat(updatedPojo.getName()).isEqualTo(newName);
                assertThat(updatedPojo.getName()).isNotEqualTo(createdNamespace.getName());
                assertThat(updatedPojo.getUpdatedAt()).isNotEqualTo(createdNamespace.getUpdatedAt());
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("Test creates namespace pojo, deletes it and creates again, expecting new id in the created entity")
    void testCreateNamespacePojoAfterDeletingIt() {
        final NamespacePojo pojo = new NamespacePojo().setName(UUID.randomUUID().toString());

        namespaceRepository.create(pojo)
            .map(NamespacePojo::getId)
            .flatMap(namespaceRepository::delete)
            .zipWhen(deletedNamespaceId -> namespaceRepository.create(pojo))
            .as(StepVerifier::create)
            .assertNext(t -> {
                assertThat(t.getT1().getIsDeleted()).isTrue();
                assertThat(t.getT1().getDeletedAt()).isNotNull();
                assertThat(t.getT1().getId()).isNotEqualTo(t.getT2().getId());
            })
            .verifyComplete();
    }
}

