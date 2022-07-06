package org.opendatadiscovery.oddplatform.service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.ListUtils;
import org.jetbrains.annotations.NotNull;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDelta;
import org.opendatadiscovery.oddplatform.dto.ingestion.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionDataStructure;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetStructurePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetStructureRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetVersionRepository;
import org.opendatadiscovery.oddplatform.utils.DatasetServiceUtils;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

@Service
@Slf4j
@RequiredArgsConstructor
public class DatasetStructureServiceImpl implements DatasetStructureService {

    @Autowired
    private final ReactiveDatasetVersionRepository reactiveDatasetVersionRepository;
    @Autowired
    private final ReactiveDatasetStructureRepository reactiveDatasetStructureRepository;
    @Autowired
    private final ReactiveDatasetFieldRepository reactiveDatasetFieldRepository;

    @Override
    public Mono<List<DatasetStructurePojo>> createDataStructure(final List<DatasetVersionPojo> versions,
                                                                final Map<String, List<DatasetFieldPojo>> datasetFields,
                                                                final List<DatasetFieldPojo> datasetFieldPojos) {
        return reactiveDatasetFieldRepository.bulkCreate(datasetFieldPojos)
            .collect(Collectors.toMap(DatasetFieldPojo::getOddrn, Function.identity()))
            .flatMap(datasetFieldPojoMap ->
                reactiveDatasetVersionRepository.bulkCreate(versions)
                    .collectList()
                    .flatMap(createdVersions -> getDatasetPojoStructure(
                        datasetFields, datasetFieldPojoMap, createdVersions))
                    .flatMap(reactiveDatasetStructureRepository::bulkCreate));
    }

    @Override
    public Mono<Tuple2<Map<String, DatasetStructureDelta>, IngestionDataStructure>> createDatasetStructureTuple(
        final IngestionDataStructure dataStructure,
        final List<Long> changedSchemaIds) {
        return reactiveDatasetVersionRepository.getLatestVersions(changedSchemaIds)
            .flatMap(latestVersions -> {
                final List<DatasetVersionPojo> latestVersionsWithPenultimates = latestVersions.stream()
                    .filter(p -> p.getVersion() > 1)
                    .collect(Collectors.toList());
                if (latestVersionsWithPenultimates.isEmpty()) {
                    return Mono.just(
                        Tuples.of(Map.<String, DatasetStructureDelta>of(), dataStructure));
                }
                return reactiveDatasetVersionRepository.getPenultimateVersions(latestVersionsWithPenultimates)
                    .defaultIfEmpty(List.of())
                    .flatMap(penultimateList -> getLastStructureDelta(
                        latestVersionsWithPenultimates, penultimateList))
                    .map(map -> Tuples.of(map, dataStructure));
            });
    }

    @Override
    public Mono<Map<String, DatasetStructureDelta>> getLastStructureDelta(final List<DatasetVersionPojo> versions,
                                                                          final Set<Long> dataVersionPojoIds) {
        return reactiveDatasetVersionRepository.getDatasetVersionPojoIds(dataVersionPojoIds)
            .flatMap(vidToFields -> {
                final Map<String, List<DatasetVersionPojo>> dsOddrnToVersions = versions
                    .stream()
                    .collect(Collectors.groupingBy(DatasetVersionPojo::getDatasetOddrn));

                return Mono.just(dsOddrnToVersions.entrySet().stream()
                    .map(e -> {
                        final List<DatasetVersionPojo> v = e.getValue().stream()
                            .sorted(Comparator.comparing(DatasetVersionPojo::getVersion))
                            .collect(Collectors.toList());

                        return Pair.of(e.getKey(), new DatasetStructureDelta(
                            vidToFields.get(v.get(0).getId()),
                            vidToFields.get(v.get(1).getId())
                        ));
                    })
                    .collect(Collectors.toMap(Pair::getLeft, Pair::getRight)));
            });
    }

    @NotNull
    private Mono<Map<String, DatasetStructureDelta>> getLastStructureDelta(
        final List<DatasetVersionPojo> latestVersions,
        final List<DatasetVersionPojo> penultimateList) {
        final List<DatasetVersionPojo> versions = ListUtils.union(latestVersions, penultimateList);
        final Set<Long> dataVersionPojoIds = versions.stream()
            .map(DatasetVersionPojo::getId)
            .collect(Collectors.toSet());
        return getLastStructureDelta(versions, dataVersionPojoIds);
    }

    @Override
    public Mono<List<DatasetVersionPojo>> getVersions(final Map<String, EnrichedDataEntityIngestionDto> datasetDict,
                                                      final Set<Long> datasetIds) {
        return reactiveDatasetVersionRepository
            .getLatestVersions(datasetIds)
            .map(fetchedVersions -> fetchedVersions.stream()
                .map(fetchedVersion -> incrementVersion(datasetDict, fetchedVersion))
                .filter(Objects::nonNull)
                .collect(Collectors.toList()));
    }

    private DatasetVersionPojo incrementVersion(final Map<String, EnrichedDataEntityIngestionDto> datasetDict,
                                                final DatasetVersionPojo fetchedVersion) {
        final EnrichedDataEntityIngestionDto dto = datasetDict.get(fetchedVersion.getDatasetOddrn());

        if (fetchedVersion.getVersionHash().equals(dto.getDataSet().structureHash())) {
            log.debug("No change in dataset structure with ID: {} found", fetchedVersion.getId());
            return null;
        }

        dto.setDatasetSchemaChanged(true);

        return DatasetServiceUtils.mapNewDatasetVersion(dto, fetchedVersion.getVersion() + 1);
    }

    @NotNull
    protected Mono<List<DatasetStructurePojo>> getDatasetPojoStructure(
        final Map<String, List<DatasetFieldPojo>> datasetFields,
        final Map<String, DatasetFieldPojo> datasetFieldPojoMap,
        final List<DatasetVersionPojo> createdVersions) {
        final List<DatasetStructurePojo> structure = createdVersions.stream()
            .flatMap(createdVersion -> datasetFields.get(createdVersion.getDatasetOddrn()).stream()
                .map(f -> datasetFieldPojoMap.get(f.getOddrn()))
                .map(DatasetFieldPojo::getId)
                .map(dfId -> new DatasetStructurePojo()
                    .setDatasetFieldId(dfId)
                    .setDatasetVersionId(createdVersion.getId())))
            .collect(Collectors.toList());
        return Mono.just(structure);
    }
}
