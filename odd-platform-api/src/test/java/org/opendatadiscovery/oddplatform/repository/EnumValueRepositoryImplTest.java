package org.opendatadiscovery.oddplatform.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.EnumValuePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveEnumValueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

public class EnumValueRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private ReactiveEnumValueRepository enumValueRepository;

    @Autowired
    private DatasetFieldRepository datasetFieldRepository;

    @Test
    @DisplayName("Returns enums that weren't deleted for a given dataset field id")
    public void getEnumValuesByFieldIdTest() {
        final var datasetFieldPojos = datasetFieldRepository
            .bulkCreate(List.of(new DatasetFieldPojo().setName("main"), new DatasetFieldPojo().setName("other")));

        final long mainDatasetFieldId = datasetFieldPojos
            .stream()
            .filter(p -> Objects.equals(p.getName(), "main"))
            .findFirst()
            .map(DatasetFieldPojo::getId)
            .orElseThrow();

        final long otherDatasetFieldId = datasetFieldPojos
            .stream()
            .filter(p -> Objects.equals(p.getName(), "other"))
            .findFirst()
            .map(DatasetFieldPojo::getId)
            .orElseThrow();

        final var softDeletedPojo = new EnumValuePojo()
            .setName("deletedPojo")
            .setDatasetFieldId(mainDatasetFieldId)
            .setIsDeleted(true)
            .setDeletedAt(LocalDateTime.now());

        final var otherDatasetPojo = new EnumValuePojo()
            .setName("otherDatasetPojo")
            .setDatasetFieldId(otherDatasetFieldId)
            .setIsDeleted(false);

        final var returnablePojo = new EnumValuePojo()
            .setName("returnablePojo")
            .setDatasetFieldId(mainDatasetFieldId)
            .setIsDeleted(false);

        enumValueRepository.bulkCreate(List.of(softDeletedPojo, otherDatasetPojo, returnablePojo)).blockLast();

        enumValueRepository.getEnumValuesByDatasetFieldId(mainDatasetFieldId)
            .as(StepVerifier::create)
            .assertNext(r ->
                assertThat(r)
                    .usingRecursiveComparison()
                    .ignoringFields("id", "createdAt", "updatedAt")
                    .isEqualTo(returnablePojo))
            .verifyComplete();
    }

    @Test
    @DisplayName("Soft deletes all enums of a given dataset field id that aren't in a provided list")
    public void softDeleteOutdatedEnumValues() {
        final var datasetFieldId = 100L;

        final var pojoToSoftDelete = new EnumValuePojo()
            .setId(4L)
            .setName("pojoToSoftDelete")
            .setDatasetFieldId(datasetFieldId)
            .setIsDeleted(false);

        final var pojoToKeep = new EnumValuePojo()
            .setId(5L)
            .setName("pojoToKeep")
            .setDatasetFieldId(datasetFieldId)
            .setIsDeleted(false);

        datasetFieldRepository.bulkCreate(List.of(new DatasetFieldPojo().setId(datasetFieldId)));

        enumValueRepository.bulkCreate(List.of(pojoToSoftDelete, pojoToKeep)).blockLast();

        enumValueRepository.softDeleteOutdatedEnumValuesExcept(datasetFieldId, List.of(pojoToKeep.getId()))
            .as(StepVerifier::create)
            .assertNext(r -> {
                assertThat(r.getId()).isEqualTo(pojoToSoftDelete.getId());
                assertThat(r.getName()).isEqualTo(pojoToSoftDelete.getName());
                assertThat(r.getIsDeleted()).isTrue();
                assertThat(r.getDeletedAt()).isNotNull();
            })
            .verifyComplete();

        enumValueRepository.getEnumValuesByDatasetFieldId(datasetFieldId)
            .as(StepVerifier::create)
            .assertNext(r ->
                assertThat(r)
                    .usingRecursiveComparison()
                    .ignoringFields("createdAt", "updatedAt")
                    .isEqualTo(pojoToKeep))
            .verifyComplete();
    }
}
