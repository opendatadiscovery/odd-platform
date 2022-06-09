package org.opendatadiscovery.oddplatform.service;

import org.jeasy.random.EasyRandom;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.mapper.DatasetFieldApiMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLabelRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("DatasetField service unit tests")
class DatasetFieldServiceImplTest {

    DatasetFieldService datasetFieldService;

    @Mock
    private DatasetFieldApiMapper datasetFieldApiMapper;
    @Mock
    private ReactiveDatasetFieldRepository reactiveDatasetFieldRepository;
    @Mock
    private ReactiveLabelRepository reactiveLabelRepository;
    @Mock
    private ReactiveSearchEntrypointRepository reactiveSearchEntrypointRepository;

    @BeforeEach
    void setUp() {
        datasetFieldService =
            new DatasetFieldServiceImpl(datasetFieldApiMapper, reactiveDatasetFieldRepository, reactiveLabelRepository,
                reactiveSearchEntrypointRepository);
    }

    @Test
    @DisplayName("Test updates dataset field")
    void testUpdateDatasetField() {
        final EasyRandom easyRandom = new EasyRandom();
        final DatasetFieldUpdateFormData datasetFieldUpdateFormData =
            easyRandom.nextObject(DatasetFieldUpdateFormData.class);
        final DatasetFieldDto datasetFieldDto = easyRandom.nextObject(DatasetFieldDto.class);
        final LabelPojo labelPojo = easyRandom.nextObject(LabelPojo.class);
        final DataSetField datasetField = easyRandom.nextObject(DataSetField.class);
        final Long datasetFieldId = datasetFieldDto.getDatasetFieldPojo().getId();

        when(reactiveDatasetFieldRepository.getDto(anyLong()))
            .thenReturn(Mono.just(datasetFieldDto));
        when(reactiveLabelRepository.listByDatasetFieldId(anyLong()))
            .thenReturn(Flux.empty());
        when(reactiveLabelRepository.listByNames(any()))
            .thenReturn(Flux.empty());
        when(reactiveDatasetFieldRepository.updateDescription(anyLong(), anyString()))
            .thenReturn(Mono.just(datasetFieldDto.getDatasetFieldPojo()));
        when(reactiveLabelRepository.deleteRelations(anyLong(), any()))
            .thenReturn(Flux.empty());
        when(reactiveLabelRepository.bulkCreate(any())).thenReturn(Flux.just(labelPojo));
        when(reactiveLabelRepository.createRelations(anyLong(), any())).thenReturn(Flux.empty());
        when(reactiveSearchEntrypointRepository.updateDatasetFieldSearchVectors(anyLong())).thenReturn(Mono.empty());
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
        final EasyRandom easyRandom = new EasyRandom();
        final DatasetFieldUpdateFormData datasetFieldUpdateFormData =
            easyRandom.nextObject(DatasetFieldUpdateFormData.class);

        when(reactiveDatasetFieldRepository.getDto(anyLong()))
            .thenReturn(Mono.empty());
        when(reactiveLabelRepository.listByDatasetFieldId(anyLong()))
            .thenReturn(Flux.empty());
        when(reactiveLabelRepository.listByNames(any()))
            .thenReturn(Flux.empty());

        final long datasetFieldId = 1L;
        datasetFieldService.updateDatasetField(datasetFieldId, datasetFieldUpdateFormData)
            .as(StepVerifier::create)
            .expectErrorMessage("DatasetField not found by id = " + datasetFieldId)
            .verify();
    }
}