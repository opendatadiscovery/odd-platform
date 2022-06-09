package org.opendatadiscovery.oddplatform.repository;

import java.util.List;
import org.jeasy.random.EasyRandom;
import org.jeasy.random.EasyRandomParameters;
import org.jooq.JSONB;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldType;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldRepository;
import org.opendatadiscovery.oddplatform.utils.JSONTestUtils;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.jeasy.random.FieldPredicates.ofType;
import static org.jooq.JSONB.jsonb;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

class ReactiveDatasetFieldRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private ReactiveDatasetFieldRepository reactiveDatasetFieldRepository;
    private static final EasyRandom EASY_RANDOM;

    static {
        final EasyRandomParameters easyRandomParameters = new EasyRandomParameters();
        easyRandomParameters.excludeField(ofType(JSONB.class));
        EASY_RANDOM = new EasyRandom(easyRandomParameters);
    }

    @Test
    @DisplayName("Test get dto from database")
    void testGetDto() {
        final DatasetFieldDto datasetFieldDto = EASY_RANDOM.nextObject(DatasetFieldDto.class);
        final List<DatasetFieldPojo> datasetFieldPojos = List.of(datasetFieldDto.getDatasetFieldPojo());
        reactiveDatasetFieldRepository.bulkCreate(datasetFieldPojos).collectList().block();
        final DatasetFieldPojo expectedDatasetFieldPojo = datasetFieldPojos.get(0);

        reactiveDatasetFieldRepository.getDto(expectedDatasetFieldPojo.getId())
            .as(StepVerifier::create)
            .assertNext(dto -> {
                assertNotNull(dto);
                assertNull(dto.getEnumValueCount());
                assertNull(dto.getParentFieldId());
                final DatasetFieldPojo actualDataSetFieldPojo = dto.getDatasetFieldPojo();
                assertThat(actualDataSetFieldPojo).isNotNull();
                assertDataField(expectedDatasetFieldPojo, actualDataSetFieldPojo);
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("Test get existing fields by oddrn and type from database")
    void testGetExistingFieldsByOddrnAndType() {
        final List<DatasetFieldDto> datasetFieldDtos = EASY_RANDOM.objects(DatasetFieldDto.class, 5).toList();
        final List<DatasetFieldPojo> datasetFieldPojos =
            datasetFieldDtos.stream()
                .map(DatasetFieldDto::getDatasetFieldPojo)
                .peek(p -> p.setType(jsonb(JSONTestUtils.createJson(EASY_RANDOM.nextObject(DataSetFieldType.class)))))
                .toList();
        final DatasetFieldPojo expectedDatasetFiledPojo = datasetFieldPojos.get(0);
        reactiveDatasetFieldRepository.bulkCreate(datasetFieldPojos).collectList().block();

        reactiveDatasetFieldRepository.getExistingFieldsByOddrnAndType(List.of(expectedDatasetFiledPojo))
            .as(StepVerifier::create)
            .assertNext(map -> {
                final String oddrn = expectedDatasetFiledPojo.getOddrn();
                final DatasetFieldPojo actualdatasetFieldPojo = map.get(oddrn);
                assertNotNull(actualdatasetFieldPojo);
                assertEquals(expectedDatasetFiledPojo.getId(), actualdatasetFieldPojo.getId());
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("Test update description")
    void testUpdateDescription() {
        final DatasetFieldDto datasetFieldDto = EASY_RANDOM.nextObject(DatasetFieldDto.class);
        final List<DatasetFieldPojo> datasetFieldPojos = List.of(datasetFieldDto.getDatasetFieldPojo());
        reactiveDatasetFieldRepository.bulkCreate(datasetFieldPojos).collectList().block();
        final DatasetFieldPojo expectedDatasetFieldPojo = datasetFieldPojos.get(0);

        final String newDescription = "new Description";
        reactiveDatasetFieldRepository.updateDescription(expectedDatasetFieldPojo.getId(), newDescription)
            .as(StepVerifier::create)
            .assertNext(datasetFieldPojo -> {
                assertNotNull(datasetFieldPojo);
                assertEquals(newDescription, datasetFieldPojo.getInternalDescription());
                assertEquals(expectedDatasetFieldPojo.getExternalDescription(),
                    datasetFieldPojo.getExternalDescription());
            })
            .verifyComplete();
    }

    private void assertDataField(final DatasetFieldPojo expectedDatasetFieldPojo,
                                 final DatasetFieldPojo actualDataSetField) {
        assertEquals(expectedDatasetFieldPojo.getId(), actualDataSetField.getId());
        assertEquals(expectedDatasetFieldPojo.getName(), actualDataSetField.getName());
        assertEquals(expectedDatasetFieldPojo.getOddrn(), actualDataSetField.getOddrn());
        assertEquals(expectedDatasetFieldPojo.getIsKey(), actualDataSetField.getIsKey());
        assertEquals(expectedDatasetFieldPojo.getIsValue(), actualDataSetField.getIsValue());
        assertEquals(expectedDatasetFieldPojo.getExternalDescription(), actualDataSetField.getExternalDescription());
        assertEquals(expectedDatasetFieldPojo.getInternalDescription(), actualDataSetField.getInternalDescription());
    }
}