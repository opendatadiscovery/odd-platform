package org.opendatadiscovery.oddplatform.repository;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataDto;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataOrigin;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataTypeEnum;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldValuePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveMetadataFieldValueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

public class MetadataFieldValueRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private MetadataFieldValueRepository metadataFieldValueRepository;

    @Autowired
    private ReactiveMetadataFieldValueRepository reactiveMetadataFieldValueRepository;

    @Autowired
    private DataEntityRepository dataEntityRepository;

    @Autowired
    private MetadataFieldRepository metadataFieldRepository;

    @Test
    public void bulkCreateTest() {
        final DataEntityPojo dataEntityPojo =
            dataEntityRepository.bulkCreate(List.of(new DataEntityPojo())).get(0);
        final MetadataFieldPojo firstFieldPojo = metadataFieldRepository.create(new MetadataFieldPojo());
        final MetadataFieldPojo secondFieldPojo = metadataFieldRepository.create(new MetadataFieldPojo());
        final MetadataFieldValuePojo firstMetadataFieldValue =
            createMetadataFieldValue(firstFieldPojo.getId(), dataEntityPojo.getId());
        final MetadataFieldValuePojo secondMetadataFieldValue =
            createMetadataFieldValue(secondFieldPojo.getId(), dataEntityPojo.getId());
        final List<MetadataFieldValuePojo> fieldValuePojos =
            metadataFieldValueRepository.bulkCreate(List.of(firstMetadataFieldValue, secondMetadataFieldValue));
        assertThat(fieldValuePojos)
            .hasSize(2)
            .hasSameElementsAs(List.of(firstMetadataFieldValue, secondMetadataFieldValue));
    }

    @Test
    public void getDtosByDataEntityIdTest() {
        final DataEntityPojo firstDataEntityPojo =
            dataEntityRepository.bulkCreate(List.of(new DataEntityPojo())).get(0);
        final DataEntityPojo secondDataEntityPojo =
            dataEntityRepository.bulkCreate(List.of(new DataEntityPojo())).get(0);
        final MetadataFieldPojo metadataFieldPojo = new MetadataFieldPojo()
            .setName(UUID.randomUUID().toString())
            .setOrigin(MetadataOrigin.INTERNAL.name())
            .setType(MetadataTypeEnum.STRING.name());
        final MetadataFieldPojo fieldPojo = metadataFieldRepository.create(metadataFieldPojo);
        final MetadataFieldValuePojo firstMetadataFieldValue =
            createMetadataFieldValue(fieldPojo.getId(), firstDataEntityPojo.getId());
        final MetadataFieldValuePojo secondMetadataFieldValue =
            createMetadataFieldValue(fieldPojo.getId(), secondDataEntityPojo.getId());
        metadataFieldValueRepository.bulkCreate(List.of(firstMetadataFieldValue, secondMetadataFieldValue));
        final List<MetadataDto> dtosByDataEntityId =
            metadataFieldValueRepository.getDtosByDataEntityId(firstDataEntityPojo.getId());
        assertThat(dtosByDataEntityId).hasSize(1);
        final MetadataDto metadataDto = dtosByDataEntityId.get(0);
        assertThat(metadataDto.metadataField().getId()).isNotNull();
        assertThat(metadataDto.metadataField().getName()).isEqualTo(metadataFieldPojo.getName());
        assertThat(metadataDto.metadataField().getType()).isEqualTo(metadataFieldPojo.getType());
        assertThat(metadataDto.metadataField().getOrigin()).isEqualTo(metadataFieldPojo.getOrigin());
        assertThat(metadataDto.metadataFieldValue().getDataEntityId())
            .isEqualTo(firstMetadataFieldValue.getDataEntityId());
        assertThat(metadataDto.metadataFieldValue().getValue())
            .isEqualTo(firstMetadataFieldValue.getValue());
        assertThat(metadataDto.metadataFieldValue().getMetadataFieldId())
            .isEqualTo(firstMetadataFieldValue.getMetadataFieldId());
    }

    @Test
    public void listByDataEntityIdsTest() {
        final DataEntityPojo firstDataEntityPojo =
            dataEntityRepository.bulkCreate(List.of(new DataEntityPojo())).get(0);
        final DataEntityPojo secondDataEntityPojo =
            dataEntityRepository.bulkCreate(List.of(new DataEntityPojo())).get(0);
        final MetadataFieldPojo fieldPojo = metadataFieldRepository.create(new MetadataFieldPojo());
        final MetadataFieldPojo secondFieldPojo = metadataFieldRepository.create(new MetadataFieldPojo());
        final MetadataFieldValuePojo firstMetadataFieldValue =
            createMetadataFieldValue(fieldPojo.getId(), firstDataEntityPojo.getId());
        final MetadataFieldValuePojo secondMetadataFieldValue =
            createMetadataFieldValue(secondFieldPojo.getId(), firstDataEntityPojo.getId());
        final MetadataFieldValuePojo thirdMetadataFieldValue =
            createMetadataFieldValue(fieldPojo.getId(), secondDataEntityPojo.getId());
        metadataFieldValueRepository.bulkCreate(
            List.of(firstMetadataFieldValue, secondMetadataFieldValue, thirdMetadataFieldValue)
        );

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
