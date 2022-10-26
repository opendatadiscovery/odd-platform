package org.opendatadiscovery.oddplatform.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.MultiValuedMap;
import org.apache.commons.collections4.multimap.HashSetValuedHashMap;
import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.jooq.JSONB;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.DataEntityFilledField;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.dto.LabelDto;
import org.opendatadiscovery.oddplatform.dto.LabelOrigin;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetFieldStat;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Tag;
import org.opendatadiscovery.oddplatform.mapper.DatasetFieldApiMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelToDatasetFieldPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLabelRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static java.util.function.Predicate.not;
import static java.util.stream.Collectors.toMap;
import static java.util.stream.Collectors.toSet;
import static org.opendatadiscovery.oddplatform.dto.DataEntityFilledField.DATASET_FIELD_LABELS;
import static reactor.function.TupleUtils.function;

@Service
@RequiredArgsConstructor
@Slf4j
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
            .zipWith(Mono.defer(() -> updateInternalDatasetFieldLabels(datasetFieldId, datasetFieldUpdateFormData)))
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
                    .filter(not(LabelDto::hasExternalRelations))
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

                        if (copyNew.getStats() == null || copyNew.getStats().data().equals("{}")) {
                            copyNew.setStats(previousVersion.getStats());
                        }

                        return copyNew;
                    })
                    .toList();

                return reactiveDatasetFieldRepository.bulkCreate(fieldsToCreate)
                    .concatWith(reactiveDatasetFieldRepository.bulkUpdate(fieldsToUpdate))
                    .collectList();
            });
    }

    @Override
    @ReactiveTransactional
    public Mono<Void> updateStatistics(final Map<String, DataSetFieldStat> stats) {
        return reactiveDatasetFieldRepository
            .getExistingFieldsByOddrn(stats.keySet())
            .collectList()
            .flatMap(existingFields -> Mono.zipDelayError(
                updateFieldsStatistics(stats, existingFields),
                updateFieldsLabels(stats, existingFields)
            ))
            .then();
    }

    private Mono<Void> updateFieldsLabels(final Map<String, DataSetFieldStat> statisticsDict,
                                          final List<DatasetFieldPojo> existingFields) {
        final Set<String> labelNames = statisticsDict.values().stream()
            .flatMap(stat -> stat.getTags() != null ? stat.getTags().stream() : Stream.empty())
            .map(Tag::getName)
            .collect(toSet());

        final Map<String, DatasetFieldPojo> datasetFieldDict = existingFields.stream()
            .collect(toMap(DatasetFieldPojo::getOddrn, identity()));

        return labelService
            .getOrCreateLabelsByName(labelNames)
            .collectMap(LabelPojo::getName, identity())
            .flatMap(labels -> {
                final Set<LabelToDatasetFieldPojo> relationsToCreate = pivotDatasetStatisticsDict(statisticsDict)
                    .entries().stream()
                    .map(e -> createExternalStatisticsRelation(
                        labels.get(e.getKey()).getId(),
                        datasetFieldDict.get(e.getValue()).getId()
                    ))
                    .collect(toSet());

                final List<Long> datasetFieldIds = datasetFieldDict.values().stream()
                    .map(DatasetFieldPojo::getId)
                    .toList();

                return reactiveLabelRepository
                    .listLabelRelations(datasetFieldIds, LabelOrigin.EXTERNAL_STATISTICS)
                    .collectList()
                    .flatMap(existingRelations -> {
                        final List<LabelToDatasetFieldPojo> relationsToDelete = existingRelations.stream()
                            .filter(r -> !relationsToCreate.contains(r))
                            .toList();

                        return reactiveLabelRepository
                            .deleteRelations(relationsToDelete)
                            .then(reactiveLabelRepository.createRelations(relationsToCreate).collectList());
                    });
            })
            .then();
    }

    private Mono<Void> updateFieldsStatistics(final Map<String, DataSetFieldStat> statisticsDict,
                                              final List<DatasetFieldPojo> existingFields) {
        final List<DatasetFieldPojo> fieldsToUpdate = new ArrayList<>();

        for (final DatasetFieldPojo field : existingFields) {
            final DataSetFieldStat stat = statisticsDict.get(field.getOddrn());
            if (stat == null) {
                log.error("Unexpected behaviour while building an update object for datasetField {}",
                    field.getOddrn());

                continue;
            }

            field.setStats(JSONB.jsonb(JSONSerDeUtils.serializeJson(stat)));
            fieldsToUpdate.add(field);
        }

        return reactiveDatasetFieldRepository.bulkUpdate(fieldsToUpdate).then();
    }

    private Mono<List<LabelDto>> updateInternalDatasetFieldLabels(
        final long datasetFieldId,
        final DatasetFieldUpdateFormData datasetFieldUpdateFormData
    ) {
        final Set<String> names = new HashSet<>(datasetFieldUpdateFormData.getLabelNames());

        return reactiveLabelRepository.listLabelRelations(List.of(datasetFieldId), LabelOrigin.INTERNAL)
            .collectList()
            .zipWith(getUpdatedRelations(names, datasetFieldId))
            .flatMap((function((current, updated) -> {
                if (labelsAreTheSame(current, updated)) {
                    return reactiveLabelRepository.listDatasetFieldDtos(datasetFieldId);
                }

                return labelService.updateDatasetFieldLabels(datasetFieldId, current, updated);
            })));
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

    private Mono<List<LabelToDatasetFieldPojo>> getUpdatedRelations(final Set<String> labelNames,
                                                                    final long datasetFieldId) {
        return labelService.getOrCreateLabelsByName(labelNames)
            .map(pojo -> new LabelToDatasetFieldPojo()
                .setLabelId(pojo.getId())
                .setDatasetFieldId(datasetFieldId)
                .setOrigin(LabelOrigin.INTERNAL.toString()))
            .collectList();
    }

    private LabelToDatasetFieldPojo createExternalStatisticsRelation(final long labelId, final long datasetFieldId) {
        return new LabelToDatasetFieldPojo()
            .setLabelId(labelId)
            .setDatasetFieldId(datasetFieldId)
            .setOrigin(LabelOrigin.EXTERNAL_STATISTICS.toString());
    }

    private MultiValuedMap<String, String> pivotDatasetStatisticsDict(
        final Map<String, DataSetFieldStat> statisticsDict
    ) {
        final MultiValuedMap<String, String> result = new HashSetValuedHashMap<>();

        statisticsDict.forEach((datasetOddrn, stat) -> {
            if (stat.getTags() != null) {
                for (final Tag tag : stat.getTags()) {
                    result.put(tag.getName(), datasetOddrn);
                }
            }
        });

        return result;
    }

    private boolean labelsAreTheSame(final List<LabelToDatasetFieldPojo> current,
                                     final List<LabelToDatasetFieldPojo> updated) {
        return CollectionUtils.isEqualCollection(extractLabelIds(current), extractLabelIds(updated));
    }

    private List<Long> extractLabelIds(final List<LabelToDatasetFieldPojo> relations) {
        return relations.stream().map(LabelToDatasetFieldPojo::getLabelId).toList();
    }
}
