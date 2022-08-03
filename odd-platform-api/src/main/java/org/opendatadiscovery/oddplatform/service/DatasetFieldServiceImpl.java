package org.opendatadiscovery.oddplatform.service;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.DataEntityFilledField;
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

import static org.opendatadiscovery.oddplatform.dto.DataEntityFilledField.DATASET_FIELD_LABELS;
import static reactor.function.TupleUtils.function;

@Service
@RequiredArgsConstructor
public class DatasetFieldServiceImpl implements DatasetFieldService {
    private final DatasetFieldApiMapper datasetFieldApiMapper;
    private final ReactiveLabelService labelService;
    private final ReactiveDatasetFieldRepository reactiveDatasetFieldRepository;
    private final ReactiveLabelRepository reactiveLabelRepository;
    private final ReactiveSearchEntrypointRepository reactiveSearchEntrypointRepository;
    private final DataEntityFilledService dataEntityFilledService;

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
            .flatMap(dto -> {
                final List<LabelDto> internalLabels = dto.getLabels().stream()
                    .filter(l -> !l.external())
                    .toList();
                if (CollectionUtils.isEmpty(internalLabels)) {
                    return dataEntityFilledService
                        .markEntityUnfilledByDatasetFieldId(datasetFieldId, DATASET_FIELD_LABELS)
                        .thenReturn(dto);
                } else {
                    return dataEntityFilledService
                        .markEntityFilledByDatasetFieldId(datasetFieldId, DATASET_FIELD_LABELS)
                        .thenReturn(dto);
                }
            })
            .map(datasetFieldApiMapper::mapDto);
    }

    @Override
    public Mono<List<DatasetFieldPojo>> createOrUpdateDatasetFields(final List<DatasetFieldPojo> fields) {
        if (fields.isEmpty()) {
            return Mono.just(List.of());
        }

        return reactiveDatasetFieldRepository.getExistingFieldsByOddrnAndType(fields)
            .flatMap(existingFieldsMap -> {
                final List<DatasetFieldPojo> fieldsToCreate = fields.stream()
                    .filter(f -> !existingFieldsMap.containsKey(f.getOddrn()))
                    .toList();

                final List<DatasetFieldPojo> fieldsToUpdate = fields.stream()
                    .filter(f -> existingFieldsMap.containsKey(f.getOddrn()))
                    .map(newField -> {
                        final DatasetFieldPojo previousVersion = existingFieldsMap.get(newField.getOddrn());
                        final DatasetFieldPojo copyNew = datasetFieldApiMapper.copy(newField);
                        copyNew.setId(previousVersion.getId());
                        copyNew.setInternalDescription(previousVersion.getInternalDescription());
                        return copyNew;
                    })
                    .toList();
                return reactiveDatasetFieldRepository.bulkCreate(fieldsToCreate)
                    .concatWith(reactiveDatasetFieldRepository.bulkUpdate(fieldsToUpdate))
                    .collectList();
            });
    }

    private Mono<List<LabelDto>> updateDatasetFieldLabels(final long datasetFieldId,
                                                          final DatasetFieldUpdateFormData datasetFieldUpdateFormData) {
        final Set<String> names = new HashSet<>(datasetFieldUpdateFormData.getLabelNames());

        return getCurrentRelations(List.of(datasetFieldId)).zipWith(getUpdatedRelations(names, datasetFieldId))
            .flatMap((function(
                (current, updated) -> {
                    if (labelsAreTheSame(current, updated)) {
                        return reactiveLabelRepository.listDatasetFieldDtos(datasetFieldId);
                    }
                    final List<LabelToDatasetFieldPojo> currentInternalRelations = current.stream()
                        .filter(pojo -> !pojo.getExternal())
                        .toList();
                    return labelService.updateDatasetFieldLabels(datasetFieldId, currentInternalRelations, updated);
                }
            )));
    }

    @NotNull
    private Mono<DatasetFieldDto> updateDescription(final long datasetFieldId,
                                                    final DatasetFieldUpdateFormData datasetFieldUpdateFormData,
                                                    final DatasetFieldDto dto) {
        final DatasetFieldPojo currentPojo = dto.getDatasetFieldPojo();
        final String newDescription = StringUtils.isEmpty(datasetFieldUpdateFormData.getDescription()) ? null
            : datasetFieldUpdateFormData.getDescription();
        if (!StringUtils.equals(currentPojo.getInternalDescription(), newDescription)) {
            currentPojo.setInternalDescription(newDescription);
            return reactiveDatasetFieldRepository.updateDescription(datasetFieldId, newDescription)
                .flatMap(pojo -> {
                    if (StringUtils.isEmpty(pojo.getInternalDescription())) {
                        return dataEntityFilledService.markEntityUnfilledByDatasetFieldId(datasetFieldId,
                            DataEntityFilledField.DATASET_FIELD_DESCRIPTION);
                    }
                    return dataEntityFilledService.markEntityFilledByDatasetFieldId(datasetFieldId,
                        DataEntityFilledField.DATASET_FIELD_DESCRIPTION);
                })
                .thenReturn(dto);
        }
        return Mono.just(dto);
    }

    private Mono<List<LabelToDatasetFieldPojo>> getCurrentRelations(final Collection<Long> datasetFieldIds) {
        return reactiveLabelRepository.listLabelRelations(datasetFieldIds)
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

    private boolean labelsAreTheSame(final List<LabelToDatasetFieldPojo> current,
                                     final List<LabelToDatasetFieldPojo> updated) {
        return CollectionUtils.isEqualCollection(extractLabelIds(current), extractLabelIds(updated));
    }

    private List<Long> extractLabelIds(final List<LabelToDatasetFieldPojo> relations) {
        return relations.stream().map(LabelToDatasetFieldPojo::getLabelId).toList();
    }
}
