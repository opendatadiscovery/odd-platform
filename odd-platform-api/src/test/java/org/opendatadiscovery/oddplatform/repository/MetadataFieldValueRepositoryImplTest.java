package org.opendatadiscovery.oddplatform.repository;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldValuePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveMetadataFieldRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveMetadataFieldValueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

public class MetadataFieldValueRepositoryImplTest extends BaseIntegrationTest {
    @Autowired
    private ReactiveMetadataFieldValueRepository reactiveMetadataFieldValueRepository;

    @Autowired
    private ReactiveDataEntityRepository dataEntityRepository;

    @Autowired
    private ReactiveMetadataFieldRepository metadataFieldRepository;

    @Test
    public void listByDataEntityIdsTest() {
        final DataEntityPojo firstDataEntityPojo = dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()))
            .collectList()
            .block()
            .get(0);
        final DataEntityPojo secondDataEntityPojo = dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()))
            .collectList()
            .block()
            .get(0);
        final MetadataFieldPojo fieldPojo = metadataFieldRepository.create(new MetadataFieldPojo()).block();
        final MetadataFieldPojo secondFieldPojo = metadataFieldRepository.create(new MetadataFieldPojo()).block();
        final MetadataFieldValuePojo firstMetadataFieldValue =
            createMetadataFieldValue(fieldPojo.getId(), firstDataEntityPojo.getId());
        final MetadataFieldValuePojo secondMetadataFieldValue =
            createMetadataFieldValue(secondFieldPojo.getId(), firstDataEntityPojo.getId());
        final MetadataFieldValuePojo thirdMetadataFieldValue =
            createMetadataFieldValue(fieldPojo.getId(), secondDataEntityPojo.getId());
        reactiveMetadataFieldValueRepository.bulkCreate(
            List.of(firstMetadataFieldValue, secondMetadataFieldValue, thirdMetadataFieldValue)
        ).block();

        reactiveMetadataFieldValueRepository.listByDataEntityIds(List.of(firstDataEntityPojo.getId()))
            .collectList()
            .as(StepVerifier::create)
            .assertNext(actual -> assertThat(actual)
                .hasSize(2)
                .hasSameElementsAs(List.of(firstMetadataFieldValue, secondMetadataFieldValue)))
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
