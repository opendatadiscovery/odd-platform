package org.opendatadiscovery.oddplatform.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldDiffState;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStructure;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetVersionDiff;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetVersionDiffList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetVersionDiffStatus;
import org.opendatadiscovery.oddplatform.dto.dataset.DatasetVersionFields;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.DatasetFieldApiMapper;
import org.opendatadiscovery.oddplatform.mapper.DatasetVersionMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetVersionRepository;
import org.opendatadiscovery.oddplatform.service.ingestion.DatasetVersionHashCalculator;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class DatasetVersionServiceImpl implements DatasetVersionService {
    private final ReactiveDatasetVersionRepository reactiveDatasetVersionRepository;
    private final DatasetVersionMapper datasetVersionMapper;
    private final DatasetFieldApiMapper datasetFieldApiMapper;
    private final DatasetVersionHashCalculator datasetVersionHashCalculator;

    @Override
    public Mono<DataSetStructure> getDatasetVersion(final long datasetId, final long datasetVersionId) {
        return reactiveDatasetVersionRepository.getDatasetVersion(datasetVersionId)
            .switchIfEmpty(Mono.error(
                new NotFoundException("Dataset version with id %s for dataset with id %s not found"
                    .formatted(datasetVersionId, datasetId))))
            .map(datasetVersionMapper::mapDatasetStructure);
    }

    @Override
    public Mono<DataSetStructure> getLatestDatasetVersion(final long datasetId) {
        return reactiveDatasetVersionRepository.getLatestDatasetVersion(datasetId)
            .switchIfEmpty(Mono.error(
                new NotFoundException("Can't find latest version for dataset with id %s".formatted(datasetId))))
            .map(datasetVersionMapper::mapDatasetStructure);
    }

    @Override
    public Mono<DataSetVersionDiffList> getDatasetVersionDiff(final long datasetId,
                                                              final long firstVersionId,
                                                              final long secondVersionId) {
        if (firstVersionId == secondVersionId) {
            return Mono.error(new BadUserRequestException("Couldn't show diff for identical versions"));
        }
        return reactiveDatasetVersionRepository.getDatasetVersionWithFields(List.of(firstVersionId, secondVersionId))
            .map(versionFields -> buildDataSetVersionDiffList(versionFields, firstVersionId, secondVersionId));
    }

    private DataSetVersionDiffList buildDataSetVersionDiffList(final List<DatasetVersionFields> versionFields,
                                                               final long firstVersionId,
                                                               final long secondVersionId) {
        if (versionFields.size() != 2) {
            throw new RuntimeException("Query returned %s rows for diff request".formatted(versionFields.size()));
        }
        final Map<Long, Map<String, DatasetFieldPojo>> versionToFieldsMap = versionFields.stream().collect(
            Collectors.toMap(
                vf -> vf.versionPojo().getId(),
                vf -> vf.fields().stream().collect(Collectors.toMap(DatasetFieldPojo::getOddrn, Function.identity()))
            ));
        final long maxVersionId = findGreaterVersionId(versionFields);
        final long minVersionId = maxVersionId == firstVersionId ? secondVersionId : firstVersionId;

        final DataSetVersionDiffList diffList = new DataSetVersionDiffList();
        final Map<String, DatasetFieldPojo> firstVersionFields = versionToFieldsMap.get(firstVersionId);
        final Map<String, DatasetFieldPojo> secondVersionFields = versionToFieldsMap.get(secondVersionId);
        final Set<String> parentOddrnChangedPojos =
            getParentOddrnChangedPojos(firstVersionFields, secondVersionFields, new HashSet<>());

        firstVersionFields.forEach((oddrn, firstVersionPojo) -> {
            final DatasetFieldPojo secondVersionPojo = secondVersionFields.get(oddrn);
            final Map<Long, DatasetFieldPojo> versionDiffFields = new HashMap<>();
            versionDiffFields.put(firstVersionId, firstVersionPojo);
            versionDiffFields.put(secondVersionId, secondVersionPojo);
            final List<DataSetVersionDiff> diff =
                calculateVersionDiff(versionDiffFields, maxVersionId, minVersionId, versionToFieldsMap,
                    parentOddrnChangedPojos);
            diffList.getFieldList().addAll(diff);
        });
        secondVersionFields.entrySet().stream()
            .filter(e -> !firstVersionFields.containsKey(e.getKey()))
            .forEach(e -> {
                final Map<Long, DatasetFieldPojo> versionDiffFields = new HashMap<>();
                versionDiffFields.put(firstVersionId, null);
                versionDiffFields.put(secondVersionId, e.getValue());
                final List<DataSetVersionDiff> diff =
                    calculateVersionDiff(versionDiffFields, maxVersionId, minVersionId, versionToFieldsMap,
                        parentOddrnChangedPojos);
                diffList.getFieldList().addAll(diff);
            });
        return diffList;
    }

    private List<DataSetVersionDiff> calculateVersionDiff(final Map<Long, DatasetFieldPojo> versionToPojo,
                                                          final long maxVersionId,
                                                          final long minVersionId,
                                                          final Map<Long, Map<String, DatasetFieldPojo>> versionFields,
                                                          final Set<String> parentOddrnChangedPojos) {
        final List<DataSetVersionDiff> result = new ArrayList<>();
        final DatasetFieldPojo maxFieldPojo = versionToPojo.get(maxVersionId);
        final DatasetFieldPojo minFieldPojo = versionToPojo.get(minVersionId);
        if (maxFieldPojo != null && parentOddrnChangedPojos.contains(maxFieldPojo.getOddrn())
            || minFieldPojo != null && parentOddrnChangedPojos.contains(minFieldPojo.getOddrn())) {
            final DataSetVersionDiff minVersionDiff = new DataSetVersionDiff();
            minVersionDiff.setStatus(DataSetVersionDiffStatus.DELETED);
            final DataSetFieldDiffState minFieldState = datasetFieldApiMapper
                .mapDiffWithParents(minFieldPojo, versionFields.get(minVersionId));
            minVersionDiff.putStatesItem(String.valueOf(minVersionId), minFieldState);
            minVersionDiff.putStatesItem(String.valueOf(maxVersionId), null);
            result.add(minVersionDiff);

            final DataSetVersionDiff maxVersionDiff = new DataSetVersionDiff();
            maxVersionDiff.setStatus(DataSetVersionDiffStatus.CREATED);
            final DataSetFieldDiffState maxFieldState = datasetFieldApiMapper
                .mapDiffWithParents(maxFieldPojo, versionFields.get(maxVersionId));
            maxVersionDiff.putStatesItem(String.valueOf(minVersionId), null);
            maxVersionDiff.putStatesItem(String.valueOf(maxVersionId), maxFieldState);
            result.add(maxVersionDiff);
        } else {
            final DataSetVersionDiff dataSetVersionDiff = new DataSetVersionDiff();
            final DataSetVersionDiffStatus status = calculateStatus(maxFieldPojo, minFieldPojo);
            dataSetVersionDiff.setStatus(status);
            versionToPojo.forEach((versionId, fieldPojo) -> {
                final DataSetFieldDiffState fieldState = fieldPojo != null
                    ? datasetFieldApiMapper.mapDiffWithParents(fieldPojo, versionFields.get(versionId)) : null;
                dataSetVersionDiff.putStatesItem(versionId.toString(), fieldState);
            });
            result.add(dataSetVersionDiff);
        }
        return result;
    }

    /**
     * @param firstVersionFields  dataset fields for the first version
     * @param secondVersionFields dataset fields for the second version
     * @param changedPojoOddrns   Dataset field oddrns, which we detected in previous iteration
     * @return dataset field oddrns, which parent field oddrn was changed and all field oddrns,
     * which are hierarchically below.
     */
    private Set<String> getParentOddrnChangedPojos(final Map<String, DatasetFieldPojo> firstVersionFields,
                                                   final Map<String, DatasetFieldPojo> secondVersionFields,
                                                   final Set<String> changedPojoOddrns) {
        final int size = changedPojoOddrns.size();
        firstVersionFields.forEach((oddrn, firstPojo) -> {
            if (changedPojoOddrns.contains(firstPojo.getParentFieldOddrn())) {
                changedPojoOddrns.add(firstPojo.getOddrn());
                return;
            }
            final DatasetFieldPojo secondPojo = secondVersionFields.get(oddrn);
            if (secondPojo == null) {
                return;
            }
            final boolean parentFieldChanged = parentFieldChanged(firstPojo, secondPojo);
            if (parentFieldChanged) {
                changedPojoOddrns.add(firstPojo.getOddrn());
            }
        });
        final int updatedSize = changedPojoOddrns.size();
        if (size == updatedSize) {
            return changedPojoOddrns;
        } else {
            return getParentOddrnChangedPojos(firstVersionFields, secondVersionFields, changedPojoOddrns);
        }
    }

    private boolean parentFieldChanged(final DatasetFieldPojo maxFieldPojo,
                                       final DatasetFieldPojo minFieldPojo) {
        if (maxFieldPojo == null || minFieldPojo == null) {
            return false;
        }
        final String maxParentFieldOddrn = maxFieldPojo.getParentFieldOddrn();
        final String minParentFieldOddrn = minFieldPojo.getParentFieldOddrn();
        return !StringUtils.equals(maxParentFieldOddrn, minParentFieldOddrn);
    }

    private DataSetVersionDiffStatus calculateStatus(final DatasetFieldPojo maxFieldPojo,
                                                     final DatasetFieldPojo minFieldPojo) {
        if (maxFieldPojo == null && minFieldPojo == null) {
            throw new RuntimeException("Couldn't calculate status. One of the fields must be presented");
        }
        if (maxFieldPojo != null && minFieldPojo != null) {
            if (fieldsAreTheSameBetweenVersions(maxFieldPojo, minFieldPojo)) {
                return DataSetVersionDiffStatus.NO_CHANGES;
            } else {
                return DataSetVersionDiffStatus.UPDATED;
            }
        }
        if (maxFieldPojo == null) {
            return DataSetVersionDiffStatus.DELETED;
        } else {
            return DataSetVersionDiffStatus.CREATED;
        }
    }

    private Long findGreaterVersionId(final List<DatasetVersionFields> versionFields) {
        return versionFields.stream()
            .max(Comparator.comparing(o -> o.versionPojo().getVersion()))
            .map(dvf -> dvf.versionPojo().getId())
            .orElseThrow(() -> new RuntimeException("Can't find greater version id"));
    }

    private boolean fieldsAreTheSameBetweenVersions(final DatasetFieldPojo firstVersionField,
                                                    final DatasetFieldPojo secondVersionField) {
        final String firstFieldHash =
            datasetVersionHashCalculator.calculateStructureHashFromPojos(List.of(firstVersionField));
        final String secondFieldHash =
            datasetVersionHashCalculator.calculateStructureHashFromPojos(List.of(secondVersionField));
        return firstFieldHash.equals(secondFieldHash);
    }
}