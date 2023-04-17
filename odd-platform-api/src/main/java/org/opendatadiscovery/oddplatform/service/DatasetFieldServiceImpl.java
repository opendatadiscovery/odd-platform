package org.opendatadiscovery.oddplatform.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.MultiValuedMap;
import org.apache.commons.collections4.multimap.HashSetValuedHashMap;
import org.apache.commons.lang3.StringUtils;
import org.jooq.JSONB;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldDescription;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldDescriptionUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldLabelsUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.Label;
import org.opendatadiscovery.oddplatform.dto.DataEntityFilledField;
import org.opendatadiscovery.oddplatform.dto.EnumValueOrigin;
import org.opendatadiscovery.oddplatform.dto.LabelOrigin;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetFieldStat;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetStatistics;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DatasetStatisticsList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Tag;
import org.opendatadiscovery.oddplatform.mapper.DatasetFieldApiMapper;
import org.opendatadiscovery.oddplatform.mapper.EnumValueMapper;
import org.opendatadiscovery.oddplatform.mapper.LabelMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityFilledPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.EnumValuePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelToDatasetFieldPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveEnumValueRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLabelRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.service.activity.ActivityLog;
import org.opendatadiscovery.oddplatform.service.activity.ActivityParameter;
import org.opendatadiscovery.oddplatform.service.ingestion.DatasetVersionHashCalculator;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static java.util.stream.Collectors.toMap;
import static java.util.stream.Collectors.toSet;
import static org.opendatadiscovery.oddplatform.dto.DataEntityFilledField.DATASET_FIELD_LABELS;
import static org.opendatadiscovery.oddplatform.utils.ActivityParameterNames.DatasetFieldInformationUpdated.DATASET_FIELD_ID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DatasetFieldServiceImpl implements DatasetFieldService {
    private final DatasetFieldApiMapper datasetFieldApiMapper;
    private final ReactiveLabelService labelService;
    private final LabelMapper labelMapper;
    private final ReactiveDatasetFieldRepository reactiveDatasetFieldRepository;
    private final ReactiveLabelRepository reactiveLabelRepository;
    private final ReactiveSearchEntrypointRepository reactiveSearchEntrypointRepository;
    private final DataEntityFilledService dataEntityFilledService;
    private final DatasetVersionHashCalculator datasetVersionHashCalculator;
    private final ReactiveEnumValueRepository enumValueRepository;
    private final EnumValueMapper enumValueMapper;

    @Override
    @ReactiveTransactional
    @ActivityLog(event = ActivityEventTypeDto.DATASET_FIELD_DESCRIPTION_UPDATED)
    public Mono<DataSetFieldDescription> updateDatasetFieldDescription(
        @ActivityParameter(DATASET_FIELD_ID) final long datasetFieldId,
        final DatasetFieldDescriptionUpdateFormData formData) {
        return reactiveDatasetFieldRepository.updateDescription(datasetFieldId, formData.getDescription())
            .switchIfEmpty(Mono.error(new NotFoundException("DatasetField", datasetFieldId)))
            .map(pojo -> new DataSetFieldDescription().description(pojo.getInternalDescription()))
            .flatMap(description -> {
                if (StringUtils.isEmpty(description.getDescription())) {
                    return dataEntityFilledService.markEntityUnfilledByDatasetFieldId(datasetFieldId,
                        DataEntityFilledField.DATASET_FIELD_DESCRIPTION).thenReturn(description);
                }
                return dataEntityFilledService.markEntityFilledByDatasetFieldId(datasetFieldId,
                    DataEntityFilledField.DATASET_FIELD_DESCRIPTION).thenReturn(description);
            })
            .flatMap(description -> reactiveSearchEntrypointRepository.updateDatasetFieldSearchVectors(datasetFieldId)
                .thenReturn(description));
    }

    @Override
    @ReactiveTransactional
    @ActivityLog(event = ActivityEventTypeDto.DATASET_FIELD_LABELS_UPDATED)
    public Flux<Label> updateDatasetFieldLabels(@ActivityParameter(DATASET_FIELD_ID) final long datasetFieldId,
                                                final DatasetFieldLabelsUpdateFormData formData) {
        final Set<String> names = new HashSet<>(formData.getLabels());
        return reactiveLabelRepository.deleteInternalRelations(datasetFieldId)
            .then(getUpdatedRelations(names, datasetFieldId))
            .flatMapMany(reactiveLabelRepository::createRelations)
            .then(reactiveSearchEntrypointRepository.updateDatasetFieldSearchVectors(datasetFieldId))
            .then(markDataEntityByLabels(formData.getLabels(), datasetFieldId))
            .then(reactiveLabelRepository.listDatasetFieldDtos(datasetFieldId))
            .flatMapMany(Flux::fromIterable)
            .map(labelMapper::mapToLabel);
    }

    @Override
    public Mono<List<DatasetFieldPojo>> createOrUpdateDatasetFields(final List<DatasetFieldPojo> fields) {
        if (fields.isEmpty()) {
            return Mono.just(List.of());
        }
        final List<String> oddrns = fields.stream().map(DatasetFieldPojo::getOddrn).toList();

        return reactiveDatasetFieldRepository.getLastVersionDatasetFieldsByOddrns(oddrns)
            .collect(Collectors.toMap(DatasetFieldPojo::getOddrn, identity()))
            .flatMap(existingFieldsMap -> {
                final DatasetFieldIngestionDto fieldIngestionDto =
                    buildDatasetFieldIngestionDto(fields, existingFieldsMap);
                final List<DatasetFieldPojo> pojosToCreate = extractPojosToCreate(fieldIngestionDto);
                final List<DatasetFieldPojo> pojosToUpdate = extractPojosToUpdate(fieldIngestionDto);

                return reactiveDatasetFieldRepository.bulkCreate(pojosToCreate)
                    .collectList()
                    .flatMapMany(createdFields ->
                        copyRelationsForNewDatasetFields(createdFields, fieldIngestionDto.fieldsToCreate()))
                    .concatWith(reactiveDatasetFieldRepository.bulkUpdate(pojosToUpdate))
                    .collectList();
            });
    }

    @Override
    @ReactiveTransactional
    public Mono<Void> updateStatistics(final DatasetStatisticsList datasetStatisticsList) {
        final Map<String, DataSetFieldStat> statistics = datasetStatisticsList.getItems().stream()
            .map(DataSetStatistics::getFields)
            .reduce(new HashMap<>(), (acc, fields) -> {
                acc.putAll(fields);
                return acc;
            });

        final Set<String> datasetOddrns = datasetStatisticsList.getItems().stream()
            .map(DataSetStatistics::getDatasetOddrn)
            .collect(toSet());

        return reactiveDatasetFieldRepository
            .getLastVersionDatasetFieldsByOddrns(new ArrayList<>(statistics.keySet()))
            .collectList()
            .flatMap(existingFields -> Mono.zipDelayError(
                updateFieldsStatistics(statistics, existingFields),
                updateFieldsLabels(statistics, existingFields)
            ))
            .then(reactiveSearchEntrypointRepository.updateStructureVectorForDataEntitiesByOddrns(datasetOddrns))
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
                final Set<LabelToDatasetFieldPojo> relationsToCreate = transposeDatasetStatisticsDict(statisticsDict)
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

    private Mono<DataEntityFilledPojo> markDataEntityByLabels(final List<String> internalLabels,
                                                              final long datasetFieldId) {
        if (CollectionUtils.isEmpty(internalLabels)) {
            return dataEntityFilledService
                .markEntityUnfilledByDatasetFieldId(datasetFieldId, DATASET_FIELD_LABELS);
        } else {
            return dataEntityFilledService
                .markEntityFilledByDatasetFieldId(datasetFieldId, DATASET_FIELD_LABELS);
        }
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

    private MultiValuedMap<String, String> transposeDatasetStatisticsDict(
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

    private List<DatasetFieldPojo> extractPojosToCreate(final DatasetFieldIngestionDto fieldIngestionDto) {
        return fieldIngestionDto.fieldsToCreate().values().stream()
            .map(pair -> getDatasetFieldUpdatedCopy(pair, false))
            .toList();
    }

    private List<DatasetFieldPojo> extractPojosToUpdate(final DatasetFieldIngestionDto fieldIngestionDto) {
        return fieldIngestionDto.fieldsToUpdate().stream()
            .map(pair -> getDatasetFieldUpdatedCopy(pair, true))
            .toList();
    }

    private DatasetFieldPojo getDatasetFieldUpdatedCopy(final DatasetFieldPair pair,
                                                        final boolean updateExisting) {
        final DatasetFieldPojo copyNew = datasetFieldApiMapper.copyWithoutId(pair.versionToIngest());
        if (pair.lastExistingVersion() != null) {
            if (updateExisting) {
                copyNew.setId(pair.lastExistingVersion().getId());
            }
            copyNew.setInternalDescription(pair.lastExistingVersion().getInternalDescription());
            if (copyNew.getStats() == null || copyNew.getStats().data().equals("{}")) {
                copyNew.setStats(pair.lastExistingVersion().getStats());
            }
        }
        return copyNew;
    }

    private Flux<DatasetFieldPojo> copyRelationsForNewDatasetFields(final List<DatasetFieldPojo> createdPojos,
                                                                    final Map<String, DatasetFieldPair> toCreate) {
        final Map<Long, Long> lastVersionToNewVersion = getLastVersionToNewVersionIdMap(createdPojos, toCreate);
        if (lastVersionToNewVersion.isEmpty()) {
            return Flux.fromIterable(createdPojos);
        }
        final Flux<LabelToDatasetFieldPojo> copyLabels = copyInternalLabelsToNewFieldVersion(lastVersionToNewVersion);
        final Flux<EnumValuePojo> copyEnumValues = copyInternalEnumValuesToNewFieldVersion(lastVersionToNewVersion);
        return copyLabels
            .thenMany(copyEnumValues)
            .thenMany(Flux.fromIterable(createdPojos));
    }

    private Map<Long, Long> getLastVersionToNewVersionIdMap(final List<DatasetFieldPojo> createdPojos,
                                                            final Map<String, DatasetFieldPair> toCreate) {
        final Map<Long, Long> lastVersionToNewVersion = new HashMap<>();
        for (final DatasetFieldPojo createdPojo : createdPojos) {
            final DatasetFieldPair datasetFieldPair = toCreate.get(createdPojo.getOddrn());
            if (datasetFieldPair == null) {
                throw new RuntimeException("Something went wrong at fields persistence");
            }
            if (datasetFieldPair.lastExistingVersion() != null) {
                lastVersionToNewVersion.put(datasetFieldPair.lastExistingVersion().getId(), createdPojo.getId());
            }
        }
        return lastVersionToNewVersion;
    }

    private Flux<LabelToDatasetFieldPojo> copyInternalLabelsToNewFieldVersion(
        final Map<Long, Long> lastVersionToNewVersion) {
        return reactiveLabelRepository.listLabelRelations(lastVersionToNewVersion.keySet(), LabelOrigin.INTERNAL)
            .map(relation -> new LabelToDatasetFieldPojo()
                .setLabelId(relation.getLabelId())
                .setOrigin(relation.getOrigin())
                .setDatasetFieldId(lastVersionToNewVersion.get(relation.getDatasetFieldId())))
            .collectList()
            .flatMapMany(reactiveLabelRepository::createRelations);
    }

    private Flux<EnumValuePojo> copyInternalEnumValuesToNewFieldVersion(final Map<Long, Long> lastVersionToNewVersion) {
        return enumValueRepository.getEnumValuesByDatasetFieldIds(lastVersionToNewVersion.keySet(),
                EnumValueOrigin.INTERNAL)
            .map(enumValuePojo -> {
                final EnumValuePojo copyNew = enumValueMapper.copyNewWithoutId(enumValuePojo);
                copyNew.setDatasetFieldId(lastVersionToNewVersion.get(enumValuePojo.getDatasetFieldId()));
                return copyNew;
            })
            .collectList()
            .flatMapMany(enumValueRepository::bulkCreate);
    }

    private DatasetFieldIngestionDto buildDatasetFieldIngestionDto(final List<DatasetFieldPojo> fieldsToIngest,
                                                                   final Map<String, DatasetFieldPojo> existingFields) {
        final Map<String, DatasetFieldPair> fieldsToCreate = new HashMap<>();
        final List<DatasetFieldPair> fieldsToUpdate = new ArrayList<>();
        fieldsToIngest.forEach(fieldPojo -> {
            final DatasetFieldPojo existingField = existingFields.get(fieldPojo.getOddrn());
            if (existingField == null) {
                fieldsToCreate.put(fieldPojo.getOddrn(), new DatasetFieldPair(null, fieldPojo));
                return;
            }
            final String newVersionHash =
                datasetVersionHashCalculator.calculateStructureHashFromPojos(List.of(fieldPojo));
            final String existingVersionHash =
                datasetVersionHashCalculator.calculateStructureHashFromPojos(List.of(existingField));
            if (newVersionHash.equals(existingVersionHash)) {
                fieldsToUpdate.add(new DatasetFieldPair(existingField, fieldPojo));
            } else {
                fieldsToCreate.put(fieldPojo.getOddrn(), new DatasetFieldPair(existingField, fieldPojo));
            }
        });
        return new DatasetFieldIngestionDto(fieldsToCreate, fieldsToUpdate);
    }

    record DatasetFieldIngestionDto(Map<String, DatasetFieldPair> fieldsToCreate,
                                    List<DatasetFieldPair> fieldsToUpdate) {
    }

    record DatasetFieldPair(DatasetFieldPojo lastExistingVersion, DatasetFieldPojo versionToIngest) {
    }
}
