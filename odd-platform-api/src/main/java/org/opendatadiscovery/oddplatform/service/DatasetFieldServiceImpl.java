package org.opendatadiscovery.oddplatform.service;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.dto.LabelDto;
import org.opendatadiscovery.oddplatform.mapper.DatasetFieldApiMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelToDatasetFieldPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLabelRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static reactor.function.TupleUtils.function;

@Service
@RequiredArgsConstructor
public class DatasetFieldServiceImpl implements DatasetFieldService {
    private final DatasetFieldApiMapper datasetFieldApiMapper;
    private final ReactiveLabelService labelService;
    private final ReactiveDatasetFieldRepository reactiveDatasetFieldRepository;
    private final ReactiveLabelRepository reactiveLabelRepository;
    private final ReactiveSearchEntrypointRepository reactiveSearchEntrypointRepository;

    @Override
    @ReactiveTransactional
    public Mono<DataSetField> updateDatasetField(final long datasetFieldId,
                                                 final DatasetFieldUpdateFormData datasetFieldUpdateFormData) {
        return reactiveDatasetFieldRepository.getDto(datasetFieldId)
            .switchIfEmpty(Mono.error(
                new IllegalArgumentException(String.format("DatasetField not found by id = %s", datasetFieldId))))
            .flatMap(dto -> updateDescription(datasetFieldId, datasetFieldUpdateFormData, dto))
            .zipWith(Mono.defer(() -> updateDatasetFieldLabels(datasetFieldId, datasetFieldUpdateFormData)))
            .map(tuple -> {
                final DatasetFieldDto dto = tuple.getT1();
                final List<LabelDto> labels = tuple.getT2();
                dto.setLabels(labels);
                return dto;
            })
            .flatMap(dto -> reactiveSearchEntrypointRepository.updateDatasetFieldSearchVectors(datasetFieldId)
                .ignoreElement().thenReturn(dto))
            .map(datasetFieldApiMapper::mapDto);
    }

    private Mono<List<LabelDto>> updateDatasetFieldLabels(final long datasetFieldId,
                                                          final DatasetFieldUpdateFormData datasetFieldUpdateFormData) {
        final Set<String> names = new HashSet<>(datasetFieldUpdateFormData.getLabelNames());

        return getCurrentRelations(List.of(datasetFieldId)).zipWith(getUpdatedRelations(names, datasetFieldId))
            .flatMap((function((current, updated) -> {
                final List<LabelToDatasetFieldPojo> pojosToDelete = current.stream()
                    .filter(r -> !updated.contains(r))
                    .toList();
                return reactiveLabelRepository.deleteRelations(pojosToDelete)
                    .then(Mono.just(updated));
            })))
            .flatMapMany(reactiveLabelRepository::createRelations)
            .then(reactiveLabelRepository.listDatasetFieldDtos(datasetFieldId));
    }

    @NotNull
    private Mono<DatasetFieldDto> updateDescription(final long datasetFieldId,
                                                    final DatasetFieldUpdateFormData datasetFieldUpdateFormData,
                                                    final DatasetFieldDto dto) {
        final DatasetFieldPojo currentPojo = dto.getDatasetFieldPojo();
        final String newDescription = datasetFieldUpdateFormData.getDescription();
        if (!StringUtils.equals(currentPojo.getInternalDescription(), newDescription)) {
            currentPojo.setInternalDescription(newDescription);
            return reactiveDatasetFieldRepository.updateDescription(datasetFieldId, newDescription)
                .thenReturn(dto);
        }
        return Mono.just(dto);
    }

    private Mono<List<LabelToDatasetFieldPojo>> getCurrentRelations(final Collection<Long> datasetFieldIds) {
        return reactiveLabelRepository.listLabelRelations(datasetFieldIds)
            .filter(pojo -> !pojo.getExternal())
            .collectList();
    }

    private Mono<List<LabelToDatasetFieldPojo>> getUpdatedRelations(final Set<String> labelNames,
                                                                    final long datasetFieldId) {
        return labelService.getOrCreateLabelsByName(labelNames)
            .map(pojo -> new LabelToDatasetFieldPojo()
                .setLabelId(pojo.getId())
                .setDatasetFieldId(datasetFieldId)
                .setExternal(false))
            .collectList();
    }
}
