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

        namespaceRepository.create(namespacePojo)
            .zipWhen(n -> namespaceRepository.get(n.getId()))
            .as(StepVerifier::create)
            .assertNext(t -> assertThat(t.getT1()).isEqualTo(t.getT2()))
            .verifyComplete();
    }

    @Test
    @DisplayName("Test creates namespace pojo by its name, expecting namespace pojo in the database")
    void testCreateByName() {
        final String name = UUID.randomUUID().toString();

        namespaceRepository.createByName(name)
            .zipWhen(n -> namespaceRepository.get(n.getId()))
            .as(StepVerifier::create)
            .assertNext(t -> assertThat(t.getT1()).isEqualTo(t.getT2()))
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

        namespaceRepository.create(pojo)
            .zipWhen(createdPojo -> namespaceRepository.update(new NamespacePojo(createdPojo).setName(newName)))
            .as(StepVerifier::create)
            .assertNext(t -> {
                assertThat(t.getT2().getId()).isEqualTo(t.getT1().getId());
                assertThat(t.getT2().getName()).isEqualTo(newName);
                assertThat(t.getT2().getName()).isNotEqualTo(t.getT1().getName());
                assertThat(t.getT2().getUpdatedAt()).isNotEqualTo(t.getT1().getUpdatedAt());
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

