package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.ArrayList;
import java.util.List;
import org.jeasy.random.EasyRandom;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldStat;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldType;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.utils.JSONTestUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.annotation.DirtiesContext;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.jooq.JSONB.jsonb;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

class ReactiveDatasetFieldRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private ReactiveDatasetFieldRepository reactiveDatasetFieldRepository;
    final EasyRandom easyRandom = new EasyRandom();

    @Test
    @DisplayName("Test get dto from database")
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.BEFORE_METHOD)
    void testGetDto() {
        final List<DatasetFieldDto> testDatasetFieldDtos = createTestDatasetFieldDtos(1);
        final List<DatasetFieldPojo> datasetFieldPojos =
            testDatasetFieldDtos.stream().map(DatasetFieldDto::getDatasetFieldPojo).toList();
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
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.BEFORE_METHOD)
    void testGetExistingFieldsByOddrnAndType() {
        final List<DatasetFieldDto> testDatasetFieldDtos = createTestDatasetFieldDtos(3);
        final List<DatasetFieldPojo> datasetFieldPojos =
            testDatasetFieldDtos.stream().map(DatasetFieldDto::getDatasetFieldPojo).toList();

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
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.BEFORE_METHOD)
    void testUpdateDescription() {
        final List<DatasetFieldDto> testDatasetFieldDtos = createTestDatasetFieldDtos(1);
        final List<DatasetFieldPojo> datasetFieldPojos =
            testDatasetFieldDtos.stream().map(DatasetFieldDto::getDatasetFieldPojo).toList();

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

    private List<DatasetFieldDto> createTestDatasetFieldDtos(final int numberOfDtos) {
        final List<DatasetFieldDto> dtos = new ArrayList<>();
        for (int i = 0; i < numberOfDtos; i++) {
            final DatasetFieldDto datasetFieldDto = easyRandom.nextObject(DatasetFieldDto.class);
            final DataSetFieldStat dataSetFieldStat = easyRandom.nextObject(DataSetFieldStat.class);
            final DataSetFieldType dataSetFieldType = easyRandom.nextObject(DataSetFieldType.class);
            final DatasetFieldPojo datasetFieldPojo = datasetFieldDto.getDatasetFieldPojo();
            datasetFieldPojo.setType(jsonb(JSONTestUtils.createJson(dataSetFieldType)));
            datasetFieldPojo.setStats(jsonb(JSONTestUtils.createJson(dataSetFieldStat)));
            dtos.add(datasetFieldDto);
        }
        return dtos;
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