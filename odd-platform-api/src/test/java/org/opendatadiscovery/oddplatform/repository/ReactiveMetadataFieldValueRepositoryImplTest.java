package org.opendatadiscovery.oddplatform.repository;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataOrigin;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldValuePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveMetadataFieldRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveMetadataFieldValueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

public class ReactiveMetadataFieldValueRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private ReactiveMetadataFieldValueRepository metadataFieldValueRepository;

    @Autowired
    private ReactiveDataEntityRepository dataEntityRepository;

    @Autowired
    private ReactiveMetadataFieldRepository metadataFieldRepository;

    @Test
    public void bulkCreateTest() {
        final DataEntityPojo dataEntityPojo =
            dataEntityRepository.bulkCreate(List.of(new DataEntityPojo())).blockLast();
        final MetadataFieldPojo firstFieldPojo = metadataFieldRepository.create(new MetadataFieldPojo()).block();
        final MetadataFieldPojo secondFieldPojo = metadataFieldRepository.create(new MetadataFieldPojo()).block();
        final MetadataFieldValuePojo firstMetadataFieldValue =
            createMetadataFieldValue(firstFieldPojo.getId(), dataEntityPojo.getId());
        final MetadataFieldValuePojo secondMetadataFieldValue =
            createMetadataFieldValue(secondFieldPojo.getId(), dataEntityPojo.getId());
        final Mono<List<MetadataFieldValuePojo>> fieldValuePojos = metadataFieldValueRepository
            .bulkCreate(List.of(firstMetadataFieldValue, secondMetadataFieldValue))
            .collectList();
        StepVerifier.create(fieldValuePojos)
            .assertNext(pojos -> assertThat(pojos)
                .hasSize(2)
                .hasSameElementsAs(List.of(firstMetadataFieldValue, secondMetadataFieldValue)))
            .verifyComplete();
    }

    @Test
    public void updateTest() {
        final DataEntityPojo dataEntityPojo =
            dataEntityRepository.bulkCreate(List.of(new DataEntityPojo())).blockLast();
        final MetadataFieldPojo fieldPojo = metadataFieldRepository.create(new MetadataFieldPojo()).block();
        final MetadataFieldValuePojo metadataFieldValue =
            createMetadataFieldValue(fieldPojo.getId(), dataEntityPojo.getId());
        final MetadataFieldValuePojo valuePojo = metadataFieldValueRepository
            .bulkCreate(List.of(metadataFieldValue))
            .blockLast();
        assertThat(valuePojo).isEqualTo(metadataFieldValue);
        valuePojo.setValue(UUID.randomUUID().toString());

        final Mono<MetadataFieldValuePojo> updatedPojo = metadataFieldValueRepository.update(valuePojo);
        StepVerifier.create(updatedPojo)
            .assertNext(pojo -> assertThat(pojo).isEqualTo(valuePojo))
            .verifyComplete();
    }

    @Test
    public void deleteTest() {
        final DataEntityPojo dataEntityPojo =
            dataEntityRepository.bulkCreate(List.of(new DataEntityPojo())).blockLast();
        final MetadataFieldPojo fieldPojo = metadataFieldRepository
            .create(new MetadataFieldPojo().setOrigin(MetadataOrigin.INTERNAL.name()))
            .block();
        final MetadataFieldValuePojo metadataFieldValue =
            createMetadataFieldValue(fieldPojo.getId(), dataEntityPojo.getId());
        metadataFieldValueRepository.bulkCreate(List.of(metadataFieldValue)).blockLast();
        metadataFieldValueRepository.delete(dataEntityPojo.getId(), fieldPojo.getId()).block();
        final Mono<List<MetadataFieldValuePojo>> pojos =
            metadataFieldValueRepository.listByDataEntityIds(List.of(dataEntityPojo.getId()), MetadataOrigin.INTERNAL);
        StepVerifier.create(pojos)
            .assertNext(list -> assertThat(list.isEmpty()).isTrue())
            .verifyComplete();
    }

    private MetadataFieldValuePojo createMetadataFieldValue(final Long metadataFieldId,
                                                            final Long dataEntityId) {
        return new MetadataFieldValuePojo()
            .setValue(UUID.randomUUID().toString())
            .setMetadataFieldId(metadataFieldId)
            .setDataEntityId(dataEntityId)
            .setActive(true);
    }
}
