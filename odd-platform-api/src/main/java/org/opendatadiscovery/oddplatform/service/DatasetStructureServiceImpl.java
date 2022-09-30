package org.opendatadiscovery.oddplatform.service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.ListUtils;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDelta;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetStructurePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetStructureRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetVersionRepository;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Slf4j
@RequiredArgsConstructor
public class DatasetStructureServiceImpl implements DatasetStructureService {
    private final ReactiveDatasetVersionRepository reactiveDatasetVersionRepository;
    private final ReactiveDatasetStructureRepository reactiveDatasetStructureRepository;
    private final DatasetFieldService datasetFieldService;

    @Override
    public Mono<Void> createDatasetStructure(final List<DatasetVersionPojo> versions,
                                             final Map<String, List<DatasetFieldPojo>> fields) {
        final List<DatasetFieldPojo> datasetFieldPojos = fields.values().stream()
            .flatMap(List::stream)
            .collect(Collectors.toList());

        return datasetFieldService.createOrUpdateDatasetFields(datasetFieldPojos)
            .map(list -> list.stream().collect(Collectors.toMap(DatasetFieldPojo::getOddrn, Function.identity())))
            .flatMap(datasetFieldPojoMap -> reactiveDatasetVersionRepository.bulkCreate(versions)
                .collectList()
                .map(createdVersions -> getDatasetPojoStructure(fields, datasetFieldPojoMap, createdVersions))
                .flatMap(reactiveDatasetStructureRepository::bulkCreateHeadless));
    }

    @Override
    public Mono<Map<String, DatasetStructureDelta>> getLastDatasetStructureVersionDelta(
        final List<Long> changedSchemaIds) {
        return reactiveDatasetVersionRepository.getLatestVersions(changedSchemaIds)
            .collectList()
            .flatMap(latestVersions -> {
                final List<DatasetVersionPojo> latestVersionsWithPenultimates = latestVersions.stream()
                    .filter(p -> p.getVersion() > 1)
                    .collect(Collectors.toList());
                if (latestVersionsWithPenultimates.isEmpty()) {
                    return Mono.just(Map.of());
                }
                return reactiveDatasetVersionRepository.getPenultimateVersions(latestVersionsWithPenultimates)
                    .flatMap(penultimateList -> getLastStructureDelta(latestVersionsWithPenultimates, penultimateList));
            });
    }

    private Mono<Map<String, DatasetStructureDelta>> getLastStructureDelta(
        final List<DatasetVersionPojo> latestVersions,
        final List<DatasetVersionPojo> penultimateList) {
        final List<DatasetVersionPojo> versions = ListUtils.union(latestVersions, penultimateList);
        final Set<Long> dataVersionPojoIds = versions.stream()
            .map(DatasetVersionPojo::getId)
            .collect(Collectors.toSet());
        return reactiveDatasetVersionRepository.getDatasetVersionFields(dataVersionPojoIds)
            .flatMap(vidToFields -> {
                final Map<String, List<DatasetVersionPojo>> dsOddrnToVersions = versions
                    .stream()
                    .collect(Collectors.groupingBy(DatasetVersionPojo::getDatasetOddrn));

                return Mono.just(dsOddrnToVersions.entrySet().stream()
                    .map(e -> {
                        final List<DatasetVersionPojo> v = e.getValue().stream()
                            .sorted(Comparator.comparing(DatasetVersionPojo::getVersion))
                            .toList();

                        return Pair.of(e.getKey(), new DatasetStructureDelta(
                            vidToFields.get(v.get(0).getId()),
                            vidToFields.get(v.get(1).getId())
                        ));
                    })
                    .collect(Collectors.toMap(Pair::getLeft, Pair::getRight)));
            });
    }

    private List<DatasetStructurePojo> getDatasetPojoStructure(
        final Map<String, List<DatasetFieldPojo>> datasetFields,
        final Map<String, DatasetFieldPojo> datasetFieldPojoMap,
        final List<DatasetVersionPojo> createdVersions) {
        return createdVersions.stream()
            .flatMap(createdVersion -> datasetFields.get(createdVersion.getDatasetOddrn()).stream()
                .map(f -> datasetFieldPojoMap.get(f.getOddrn()))
                .map(DatasetFieldPojo::getId)
                .map(dfId -> new DatasetStructurePojo()
                    .setDatasetFieldId(dfId)
                    .setDatasetVersionId(createdVersion.getId())))
            .collect(Collectors.toList());
    }
}
