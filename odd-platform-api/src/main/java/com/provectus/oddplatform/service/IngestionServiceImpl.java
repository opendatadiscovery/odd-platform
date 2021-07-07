package com.provectus.oddplatform.service;

import com.provectus.oddplatform.dto.DataEntityDto;
import com.provectus.oddplatform.dto.DataEntityIngestionDto;
import com.provectus.oddplatform.dto.DataEntityIngestionDtoSplit;
import com.provectus.oddplatform.dto.DataEntityType;
import com.provectus.oddplatform.dto.MetadataBinding;
import com.provectus.oddplatform.dto.MetadataFieldKey;
import com.provectus.oddplatform.exception.NotFoundException;
import com.provectus.oddplatform.ingestion.contract.model.DataEntityList;
import com.provectus.oddplatform.mapper.DatasetFieldMapper;
import com.provectus.oddplatform.mapper.IngestionMapper;
import com.provectus.oddplatform.model.tables.pojos.DataEntityPojo;
import com.provectus.oddplatform.model.tables.pojos.DataSourcePojo;
import com.provectus.oddplatform.model.tables.pojos.DatasetFieldPojo;
import com.provectus.oddplatform.model.tables.pojos.DatasetRevisionPojo;
import com.provectus.oddplatform.model.tables.pojos.DatasetVersionPojo;
import com.provectus.oddplatform.model.tables.pojos.LineagePojo;
import com.provectus.oddplatform.model.tables.pojos.MetadataFieldPojo;
import com.provectus.oddplatform.model.tables.pojos.MetadataFieldValuePojo;
import com.provectus.oddplatform.repository.DataEntityRepository;
import com.provectus.oddplatform.repository.DataSourceRepository;
import com.provectus.oddplatform.repository.DatasetFieldRepository;
import com.provectus.oddplatform.repository.DatasetRevisionRepository;
import com.provectus.oddplatform.repository.DatasetVersionRepository;
import com.provectus.oddplatform.repository.LineageRepository;
import com.provectus.oddplatform.repository.MetadataFieldRepository;
import com.provectus.oddplatform.repository.MetadataFieldValueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.BiFunction;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.provectus.oddplatform.dto.DataEntityType.*;
import static java.util.function.Function.identity;

@Service
@RequiredArgsConstructor
@Slf4j
public class IngestionServiceImpl implements IngestionService {
    private final DataSourceRepository dataSourceRepository;
    private final DataEntityRepository dataEntityRepository;
    private final DatasetRevisionRepository datasetRevisionRepository;
    private final DatasetVersionRepository datasetVersionRepository;
    private final DatasetFieldRepository datasetFieldRepository;
    private final MetadataFieldRepository metadataFieldRepository;
    private final MetadataFieldValueRepository metadataFieldValueRepository;
    private final LineageRepository lineageRepository;

    private final IngestionMapper ingestionMapper;
    private final DatasetFieldMapper datasetFieldMapper;

    public Mono<Void> ingest(final DataEntityList dataEntityList) {
        final Mono<Long> dsIdMono = Mono.just(dataEntityList.getDataSourceOddrn())
            .map(dataSourceRepository::getByOddrn)
            .flatMap(opt -> opt.isEmpty()
                ? Mono.error(new NotFoundException("Data source with oddrn %s hasn't been found", dataEntityList.getDataSourceOddrn()))
                : Mono.just(opt.get()))
            .map(DataSourcePojo::getId);

        final Mono<DataEntityIngestionDtoSplit> splitMono = dsIdMono
            .map(dsId -> DataEntityIngestionDto.fromDataEntityList(dsId, dataEntityList.getItems()))
            .map(dtos -> dtos.stream().collect(Collectors.toMap(DataEntityIngestionDto::getOddrn, item -> item)))
            .flatMap(dtos -> Flux.fromIterable(dataEntityRepository
                .listAllByOddrns(dtos.keySet()))
                .collectMap(dto -> dto.getDataEntity().getOddrn(), DataEntityDto::getDataEntity)
                .zipWith(Mono.just(dtos)))
            .map(this::makeSplit);

        final Mono<DataEntityIngestionDtoSplit> enrichedSplit = splitMono
            .flatMap(split -> {
                final Mono<List<DataEntityPojo>> existingEntities = Mono.just(split.getExistingEntities())
                    .map(ingestionMapper::dtoToPojo)
                    .map(dataEntityRepository::bulkUpdate);

                final Mono<Object> lineageRelations =
                    Mono.fromRunnable(() -> lineageRepository.createLineagePaths(split.getLineageRelations()));

                final Mono<DataEntityIngestionDtoSplit> es = Mono.just(split.getNewEntities())
                    .map(ingestionMapper::ingestDtoToDto)
                    .map(dataEntityRepository::bulkCreate)
                    .flatMapIterable(identity())
                    .collectMap(dto -> dto.getDataEntity().getOddrn(), DataEntityDto::getDataEntity)
                    .map(rmap -> enrichWithIds(split, rmap))
                    .map(newEntities -> new DataEntityIngestionDtoSplit(newEntities, split.getExistingEntities(),
                        split.getLineageRelations(), split.getHollowOddrns()));

                final Mono<Object> hollow =
                    Mono.fromRunnable(() -> dataEntityRepository.createHollow(split.getHollowOddrns()));

                return Mono.zipDelayError(existingEntities, es)
                    .map(Tuple2::getT2)
                    .flatMap(s -> Mono.zipDelayError(lineageRelations, hollow).then(Mono.just(s)));
            });

        return enrichedSplit
            .flatMap(split -> Mono
                .zipDelayError(ingestDatasetRevisions(split), ingestDatasetStructure(split), ingestMetadata(split))
                .map(__ -> split))
            .flatMap(this::calculateSearchEntrypoints)
            .then();
    }

    private DataEntityIngestionDtoSplit makeSplit(
        final Tuple2<Map<String, DataEntityPojo>, Map<String, DataEntityIngestionDto>> tuple
    ) {
        final Map<String, DataEntityIngestionDto> dtosGrouped = tuple.getT2();
        final Map<String, DataEntityPojo> deGrouped = tuple.getT1();

        final List<DataEntityIngestionDto> newEntities = new ArrayList<>();
        final List<DataEntityIngestionDto> existingEntities = new ArrayList<>();

        dtosGrouped.forEach((oddrn, dto) -> {
            if (deGrouped.containsKey(oddrn)) {
                final DataEntityPojo dePojo = deGrouped.get(oddrn);

                if (dto.getUpdatedAt() == null || isEntityUpdated(dto, dePojo)) {
                    dto.setId(dePojo.getId());
                    existingEntities.add(dto);
                }
            } else {
                newEntities.add(dto);
            }
        });

        final List<LineagePojo> relations = Stream
            .concat(newEntities.stream(), existingEntities.stream())
            .map(this::extractRelations)
            .flatMap(List::stream)
            .collect(Collectors.toList());

        final Set<String> possibleHollowOddrns = relations.stream()
            .map(p -> List.of(p.getChildOddrn(), p.getParentOddrn()))
            .flatMap(List::stream)
            .collect(Collectors.toSet());

        return new DataEntityIngestionDtoSplit(newEntities, existingEntities, relations, possibleHollowOddrns);
    }

    private List<LineagePojo> extractRelations(final DataEntityIngestionDto dto) {
        final Set<DataEntityType> types = dto.getTypes();

        final ArrayList<LineagePojo> result = new ArrayList<>();

        final String dtoOddrn = dto.getOddrn().toLowerCase();

        if (types.contains(DATA_SET)) {
            if (dto.getParentDatasetOddrn() != null) {
                result.add(new LineagePojo()
                    .setParentOddrn(dto.getParentDatasetOddrn().toLowerCase())
                    .setChildOddrn(dtoOddrn));
            }
        }

        if (types.contains(DATA_TRANSFORMER)) {
            dto.getSourceList().stream()
                .map(source -> new LineagePojo().setParentOddrn(source.toLowerCase()).setChildOddrn(dtoOddrn))
                .forEach(result::add);

            dto.getTargetList().stream()
                .map(target -> new LineagePojo().setParentOddrn(dtoOddrn).setChildOddrn(target.toLowerCase()))
                .forEach(result::add);
        }

        if (types.contains(DATA_CONSUMER)) {
            dto.getInputList().stream()
                .map(input -> new LineagePojo().setParentOddrn(input.toLowerCase()).setChildOddrn(dtoOddrn))
                .forEach(result::add);
        }

        return result;
    }

    private List<DataEntityIngestionDto> enrichWithIds(final DataEntityIngestionDtoSplit split,
                                                       final Map<String, DataEntityPojo> rmap) {
        return split.getNewEntities().stream()
            .peek(dto -> dto.setId(rmap.get(dto.getOddrn()).getId()))
            .collect(Collectors.toList());
    }

    private Mono<List<DatasetRevisionPojo>> ingestDatasetRevisions(final DataEntityIngestionDtoSplit entities) {
        var now = LocalDateTime.now();

        final Flux<DatasetRevisionPojo> newDatasetRevisions = Flux.fromStream(entities.getNewEntities().stream()
            .filter(e -> e.getTypes().contains(DATA_SET))
            .map(e -> new DatasetRevisionPojo()
                .setDataEntityId(e.getId())
                .setUpdatedAt(e.getUpdatedAt() != null ? e.getUpdatedAt().toLocalDateTime() : now)
                .setRowsCount(e.getRowsCount())));

        final List<Long> existingEntitiesIds = entities.getExistingEntities().stream()
            .map(DataEntityIngestionDto::getId)
            .collect(Collectors.toList());

        final Flux<DatasetRevisionPojo> existingDR = Flux
            .fromIterable(datasetRevisionRepository.listLatestByDatasetIds(existingEntitiesIds))
            .collectMap(DatasetRevisionPojo::getDataEntityId, identity())
            .map(drRecords -> entities.getExistingEntities()
                .stream()
                .filter(e -> e.getTypes().contains(DATA_SET))
                .map(e -> {
                    final DatasetRevisionPojo existingRevision = drRecords.get(e.getId());
                    if (existingRevision == null) {
                        log.error("There's no DatasetRevision for existing {}", e.getOddrn());
                        return null;
                    }

                    if (Objects.equals(existingRevision.getRowsCount(), e.getRowsCount()) &&
                        e.getUpdatedAt() != null &&
                        Objects.equals(existingRevision.getUpdatedAt(), e.getUpdatedAt().toLocalDateTime())) {
                        return null;
                    }

                    return new DatasetRevisionPojo(
                        e.getId(),
                        e.getUpdatedAt() != null ? e.getUpdatedAt().toLocalDateTime() : now,
                        e.getRowsCount()
                    );
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList()))
            .flatMapIterable(identity());

        return Flux.merge(newDatasetRevisions, existingDR)
            .collectList()
            .map(datasetRevisionRepository::bulkCreate);
    }

    // TODO: combine result type to list
    private Mono<Tuple2<List<DatasetFieldPojo>, List<DatasetFieldPojo>>> ingestDatasetStructure(final DataEntityIngestionDtoSplit split) {
        var now = LocalDateTime.now();

        // TODO: move to the split? Seems like it's used everywhere
        final Map<Long, DataEntityIngestionDto> newEntities = split.getNewEntities().stream()
            .collect(Collectors.toMap(DataEntityIngestionDto::getId, identity()));

        final List<DatasetVersionPojo> newVersionPojos = split.getNewEntities().stream()
            .filter(e -> e.getTypes().contains(DATA_SET))
            .map(e -> new DatasetVersionPojo(null, e.getId(), 1L, e.getStructureHash(), now))
            .collect(Collectors.toList());

        final Mono<List<DatasetFieldPojo>> newStructure = Mono.just(newVersionPojos)
            .map(datasetVersionRepository::bulkCreate)
            .map(dsvList -> dsvList.stream()
                .map(dsv -> datasetFieldMapper.toPojo(newEntities.get(dsv.getDatasetId()).getFieldList(), dsv.getId()))
                .collect(Collectors.toList()))
            .map(fields -> datasetFieldRepository.bulkCreate(fields
                .stream()
                .flatMap(List::stream)
                .collect(Collectors.toList())));

        final Map<Long, DataEntityIngestionDto> existingEntities = split.getExistingEntities().stream()
            .filter(e -> e.getTypes().contains(DATA_SET))
            .collect(Collectors.toMap(DataEntityIngestionDto::getId, identity()));

        final Mono<List<DatasetFieldPojo>> existingStructure = Mono.just(existingEntities.keySet())
            .map(datasetVersionRepository::getLatestVersions)
            .map(versions -> versions.stream()
                .map(v -> {
                    final DataEntityIngestionDto dto = existingEntities.get(v.getDatasetId());

                    // TODO: move to the select: IN -> (AND + OR)
                    if (v.getVersionHash().equals(dto.getStructureHash())) {
                        log.info("no change in structure with ID: {} found", v.getId());
                        return null;
                    }

                    return new DatasetVersionPojo(null, v.getDatasetId(), v.getVersion() + 1, dto.getStructureHash(), null);
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList()))
            .map(datasetVersionRepository::bulkCreate)
            .map(pojos -> pojos.stream().collect(Collectors.toMap(
                DatasetVersionPojo::getDatasetId,
                DatasetVersionPojo::getId)
            ))
            .map(dsv -> intersection(
                dsv,
                existingEntities,
                (dsvId, deDto) -> datasetFieldMapper.toPojo(deDto.getFieldList(), dsvId)
            ))
            .map(map -> datasetFieldRepository.bulkCreate(map.values()
                .stream()
                .flatMap(List::stream)
                .collect(Collectors.toList())));

        return Mono.zipDelayError(newStructure, existingStructure);
    }

    private Mono<Integer> ingestMetadata(final DataEntityIngestionDtoSplit split) {
        final HashMap<MetadataFieldKey, Map<Long, Object>> allMetadata = new HashMap<>();

        for (final DataEntityIngestionDto allEntity : split.getAllEntities()) {
            allEntity.getMetadata().forEach((mfName, mfValue) -> {
                final MetadataFieldKey.MetadataTypeEnum fieldType = isDate(mfValue)
                    ? MetadataFieldKey.MetadataTypeEnum.DATETIME
                    : MetadataFieldKey.MetadataTypeEnum.getMetadataType(mfValue.getClass());

                if (fieldType.equals(MetadataFieldKey.MetadataTypeEnum.UNKNOWN)) {
                    log.error("Unknown metadata field: {} -- {}", mfName, mfValue);
                    return;
                }

                allMetadata.compute(new MetadataFieldKey(mfName, fieldType), (k, map) -> {
                    if (map == null) {
                        map = new HashMap<>();
                    }

                    map.put(allEntity.getId(), mfValue);

                    return map;
                });
            });
        }

        final Mono<Map<MetadataBinding, MetadataFieldValuePojo>> mfvAll =
            Mono.just(split.getAllEntities().stream().map(DataEntityIngestionDto::getId).collect(Collectors.toList()))
                .map(metadataFieldValueRepository::listByDataEntityIds)
                .map(mfList -> mfList.stream().collect(Collectors.toMap(
                    mf -> new MetadataBinding(mf.getDataEntityId(), mf.getMetadataFieldId()),
                    identity()
                )));

        final Mono<Map<MetadataFieldKey, MetadataFieldPojo>> metadataFields = Mono
            // TODO: fromCallable
            .just(metadataFieldRepository.listByKey(allMetadata.keySet()))
            .map(mfs -> mfs.stream().collect(Collectors.toMap(
                mf -> new MetadataFieldKey(mf.getName(), mf.getType()),
                identity()
            )))
            .map(existingMfs -> {
                final HashMap<MetadataFieldKey, MetadataFieldPojo> newMfs = new HashMap<>();
                allMetadata.forEach((id, __) -> {
                    if (!existingMfs.containsKey(id)) {
                        newMfs.put(id, new MetadataFieldPojo(null, id.getFieldType().toString(),
                            id.getFieldName(), "EXTERNAL", null));
                    }
                });

                return Stream.concat(
                    existingMfs.values().stream(),
                    metadataFieldRepository.bulkCreate(newMfs.values()).stream()
                ).collect(Collectors.toMap(
                    mf -> new MetadataFieldKey(mf.getName(), mf.getType()),
                    identity()
                ));
            });

        return Mono.zip(Mono.just(allMetadata), mfvAll, metadataFields)
            .map(t -> {
                final ArrayList<MetadataFieldValuePojo> update = new ArrayList<>();
                final ArrayList<MetadataFieldValuePojo> create = new ArrayList<>();

                t.getT1().forEach((mfKey, values) -> values.forEach((deId, value) -> {
                    final MetadataFieldPojo mf = t.getT3().get(mfKey);
                    final MetadataFieldValuePojo mfValue = t.getT2().get(new MetadataBinding(deId, mf.getId()));

                    if (mfValue != null) {
                        mfValue.setValue(value.toString());
                        update.add(mfValue);
                    } else {
                        create.add(new MetadataFieldValuePojo(deId, mf.getId(), value.toString(), true));
                    }
                }));

                // TODO: parallel
                metadataFieldValueRepository.bulkCreate(create);
                metadataFieldValueRepository.bulkUpdate(update);

                return 0;
            });
    }

    private Mono<Void> calculateSearchEntrypoints(final DataEntityIngestionDtoSplit split) {
        return Mono.fromRunnable(() -> dataEntityRepository.calculateSearchEntrypoints(
            split.getNewEntities().stream().map(DataEntityIngestionDto::getId).collect(Collectors.toList()),
            split.getExistingEntities().stream().map(DataEntityIngestionDto::getId).collect(Collectors.toList())
        ));
    }

    private boolean isDate(final Object object) {
        return object.getClass().equals(String.class) && isDate(object.toString());
    }

    private boolean isDate(final String string) {
        try {
            LocalDateTime.parse(string, DateTimeFormatter.ISO_DATE_TIME);
        } catch (final DateTimeParseException ignored) {
            return false;
        }
        return true;
    }

    private boolean isEntityUpdated(final DataEntityIngestionDto dto, final DataEntityPojo dePojo) {
        return !dto.getUpdatedAt().equals(dePojo.getUpdatedAt().atOffset(dto.getUpdatedAt().getOffset()));
    }

    private <K, V1, V2, V> Map<K, V> intersection(final Map<K, V1> left,
                                                  final Map<K, V2> right,
                                                  final BiFunction<V1, V2, V> mapper) {
        final Map<K, V> intersection = new HashMap<>();
        for (final Map.Entry<K, V1> entry : left.entrySet()) {
            final K key = entry.getKey();
            if (right.containsKey(key))
                intersection.put(key, mapper.apply(entry.getValue(), right.get(key)));
        }
        return intersection;
    }
}