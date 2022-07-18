package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.jeasy.random.EasyRandom;
import org.junit.Ignore;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldStat;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldType;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.dto.LabelDto;
import org.opendatadiscovery.oddplatform.mapper.DatasetFieldApiMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelToDatasetFieldPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLabelRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.utils.JSONTestUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.jooq.JSONB.jsonb;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("DatasetField service unit tests")
class DatasetFieldServiceImplTest {
    private static final EasyRandom EASY_RANDOM = new EasyRandom();

    DatasetFieldService datasetFieldService;

    @Mock
    private DatasetFieldApiMapper datasetFieldApiMapper;
    @Mock
    private ReactiveLabelService reactiveLabelService;
    @Mock
    private ReactiveDatasetFieldRepository reactiveDatasetFieldRepository;
    @Mock
    private ReactiveLabelRepository reactiveLabelRepository;
    @Mock
    private ReactiveSearchEntrypointRepository reactiveSearchEntrypointRepository;

    @BeforeEach
    void setUp() {
        datasetFieldService = new DatasetFieldServiceImpl(
            datasetFieldApiMapper,
            reactiveLabelService,
            reactiveDatasetFieldRepository,
            reactiveLabelRepository,
            reactiveSearchEntrypointRepository);
    }

    @Test
    @Ignore
    @DisplayName("Test updates dataset field")
    void testUpdateDatasetField() {
        final DatasetFieldUpdateFormData datasetFieldUpdateFormData =
            EASY_RANDOM.nextObject(DatasetFieldUpdateFormData.class);
        final DatasetFieldDto datasetFieldDto = createDatasetFieldDto();
        final LabelPojo labelPojo = EASY_RANDOM.nextObject(LabelPojo.class);
        final DataSetField datasetField = EASY_RANDOM.nextObject(DataSetField.class);
        final Long datasetFieldId = datasetFieldDto.getDatasetFieldPojo().getId();

        when(reactiveDatasetFieldRepository.getDto(anyLong()))
            .thenReturn(Mono.just(datasetFieldDto));
        when(reactiveLabelRepository.listLabelRelations(any()))
            .thenReturn(Flux.just(EASY_RANDOM.nextObject(LabelToDatasetFieldPojo.class)));
        when(reactiveLabelService.getOrCreateLabelsByName(any()))
            .thenReturn(Flux.just(labelPojo));
        when(reactiveDatasetFieldRepository.updateDescription(anyLong(), anyString()))
            .thenReturn(Mono.just(datasetFieldDto.getDatasetFieldPojo()));
        when(reactiveLabelRepository.deleteRelations(any()))
            .thenReturn(Flux.just(EASY_RANDOM.nextObject(LabelToDatasetFieldPojo.class)));
        when(reactiveLabelRepository.createRelations(any()))
            .thenReturn(Flux.just(EASY_RANDOM.nextObject(LabelToDatasetFieldPojo.class)));
        when(reactiveLabelRepository.listDatasetFieldDtos(any())).thenReturn(
            Mono.just(List.of(new LabelDto(labelPojo, false))));
        when(reactiveSearchEntrypointRepository.updateDatasetFieldSearchVectors(anyLong())).thenReturn(Mono.just(1));
        when(datasetFieldApiMapper.mapDto(any())).thenReturn(datasetField);

        datasetFieldService.updateDatasetField(datasetFieldId, datasetFieldUpdateFormData)
            .as(StepVerifier::create)
            .assertNext(dsf -> {
                assertNotNull(dsf);
                assertEquals(datasetField.getId(), dsf.getId());
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("Test updates dataset field, expecting exception dto not found")
    void testUpdateDatasetFieldDtoNotFound() {
        final DatasetFieldUpdateFormData datasetFieldUpdateFormData =
            EASY_RANDOM.nextObject(DatasetFieldUpdateFormData.class);

        when(reactiveDatasetFieldRepository.getDto(anyLong()))
            .thenReturn(Mono.empty());

        final long datasetFieldId = 1L;
        datasetFieldService.updateDatasetField(datasetFieldId, datasetFieldUpdateFormData)
            .as(StepVerifier::create)
            .expectErrorMessage("DatasetField not found by id = " + datasetFieldId)
            .verify();
    }

    private DatasetFieldDto createDatasetFieldDto() {
        final DatasetFieldPojo datasetFieldPojo = EASY_RANDOM.nextObject(DatasetFieldPojo.class);
        final DataSetFieldStat dataSetFieldStat = EASY_RANDOM.nextObject(DataSetFieldStat.class);
        final DataSetFieldType dataSetFieldType = EASY_RANDOM.nextObject(DataSetFieldType.class);
        final LabelPojo labelPojo = EASY_RANDOM.nextObject(LabelPojo.class);
        final DatasetFieldDto datasetFieldDto = new DatasetFieldDto();
        datasetFieldDto.setDatasetFieldPojo(datasetFieldPojo);
        datasetFieldDto.setParentFieldId(1L);
        datasetFieldDto.setEnumValueCount(2);
        datasetFieldDto.setLabels(List.of(new LabelDto(labelPojo, false)));
        datasetFieldDto.getDatasetFieldPojo().setType(jsonb(JSONTestUtils.createJson(dataSetFieldType)));
        datasetFieldDto.getDatasetFieldPojo().setStats(jsonb(JSONTestUtils.createJson(dataSetFieldStat)));
        return datasetFieldDto;
    }
}