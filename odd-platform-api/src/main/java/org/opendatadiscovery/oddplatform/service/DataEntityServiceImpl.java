package org.opendatadiscovery.oddplatform.service;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityClassAndTypeDictionary;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDataEntityGroupFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityUsageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.InternalDescription;
import org.opendatadiscovery.oddplatform.api.contract.model.InternalDescriptionFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.InternalName;
import org.opendatadiscovery.oddplatform.api.contract.model.InternalNameFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldValue;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldValueList;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldValueUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataObject;
import org.opendatadiscovery.oddplatform.api.contract.model.Tag;
import org.opendatadiscovery.oddplatform.api.contract.model.TagsFormData;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.TagDto;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.dto.attributes.DataConsumerAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataEntityAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataInputAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataQualityTestAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataSetAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataTransformerAttributes;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageDepth;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataDto;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataKey;
import org.opendatadiscovery.oddplatform.dto.term.TermRefDto;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.DataEntityMapper;
import org.opendatadiscovery.oddplatform.mapper.MetadataFieldMapper;
import org.opendatadiscovery.oddplatform.mapper.MetadataFieldValueMapper;
import org.opendatadiscovery.oddplatform.mapper.TagMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GroupEntityRelationsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldValuePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityStatisticsRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityTaskRunRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetVersionRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveGroupEntityRelationRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLineageRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveMetadataFieldRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveMetadataFieldValueRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTagRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.opendatadiscovery.oddplatform.service.activity.ActivityLog;
import org.opendatadiscovery.oddplatform.service.activity.ActivityParameter;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuples;

import static java.util.function.Function.identity;
import static java.util.stream.Collectors.toList;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_ENTITY_GROUP;
import static org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto.DataSetDetailsDto;
import static org.opendatadiscovery.oddplatform.dto.DataEntityFilledField.CUSTOM_GROUP;
import static org.opendatadiscovery.oddplatform.dto.DataEntityFilledField.INTERNAL_DESCRIPTION;
import static org.opendatadiscovery.oddplatform.dto.DataEntityFilledField.INTERNAL_METADATA;
import static org.opendatadiscovery.oddplatform.dto.DataEntityFilledField.INTERNAL_NAME;
import static org.opendatadiscovery.oddplatform.dto.DataEntityFilledField.INTERNAL_TAGS;
import static org.opendatadiscovery.oddplatform.dto.metadata.MetadataOrigin.INTERNAL;
import static org.opendatadiscovery.oddplatform.utils.ActivityParameterNames.DescriptionUpdated.DATA_ENTITY_ID;
import static reactor.function.TupleUtils.function;

@Service
@Slf4j
@RequiredArgsConstructor
public class DataEntityServiceImpl implements DataEntityService {
    private final AuthIdentityProvider authIdentityProvider;
    private final TagService tagService;
    private final DataEntityFilledService dataEntityFilledService;
    private final MetadataFieldService metadataFieldService;

    private final ReactiveMetadataFieldValueRepository reactiveMetadataFieldValueRepository;
    private final ReactiveMetadataFieldRepository reactiveMetadataFieldRepository;
    private final ReactiveDataEntityRepository reactiveDataEntityRepository;
    private final ReactiveLineageRepository reactiveLineageRepository;
    private final ReactiveDataEntityTaskRunRepository reactiveDataEntityTaskRunRepository;
    private final ReactiveDatasetVersionRepository reactiveDatasetVersionRepository;
    private final ReactiveTermRepository reactiveTermRepository;
    private final ReactiveSearchEntrypointRepository reactiveSearchEntrypointRepository;
    private final ReactiveGroupEntityRelationRepository reactiveGroupEntityRelationRepository;
    private final ReactiveDataEntityStatisticsRepository dataEntityStatisticsRepository;
    private final ReactiveTagRepository tagRepository;

    private final DataEntityMapper dataEntityMapper;
    private final MetadataFieldMapper metadataFieldMapper;
    private final MetadataFieldValueMapper metadataFieldValueMapper;
    private final TagMapper tagMapper;

    @Override
    public Mono<DataEntityClassAndTypeDictionary> getDataEntityClassesAndTypes() {
        return Mono.just(dataEntityMapper.getTypeDict());
    }

    @Override
    public Mono<DataEntityDimensionsDto> getDimensions(final long dataEntityId) {
        return reactiveDataEntityRepository.getDimensions(dataEntityId)
            .switchIfEmpty(Mono.error(new NotFoundException("Data entity", dataEntityId)))
            .flatMap(dto -> enrichEntityClassDetails(List.of(dto)))
            .flatMap(this::enrichParentGroups)
            .map(list -> list.get(0));
    }

    @Override
    public Mono<List<DataEntityDimensionsDto>> getDimensions(final Collection<String> oddrns) {
        return reactiveDataEntityRepository.getDimensions(oddrns)
            .flatMap(this::enrichEntityClassDetails)
            .flatMap(this::enrichParentGroups);
    }

    @Override
    public Mono<DataEntityList> findByState(final FacetStateDto state,
                                            final int page,
                                            final int size,
                                            final OwnerPojo owner) {
        final Mono<List<DataEntityDimensionsDto>> enrichedDimensions = reactiveDataEntityRepository
            .findByState(state, page, size, owner)
            .flatMap(this::enrichEntityClassDetails)
            .flatMap(this::enrichParentGroups);
        final Mono<Long> count = reactiveDataEntityRepository.countByState(state, owner);
        return Mono.zip(enrichedDimensions, count)
            .map(function((dtos, total) -> new Page<>(dtos, total, true)))
            .map(dataEntityMapper::mapPojos);
    }

    @Override
    @ReactiveTransactional
    public Mono<DataEntityDetails> getDetails(final long dataEntityId) {
        return reactiveDataEntityRepository.getDetails(dataEntityId)
            .switchIfEmpty(Mono.error(new NotFoundException("Data entity", dataEntityId)))
            .flatMap(dto -> enrichEntityClassDetails(List.of(dto)))
            .flatMap(this::enrichParentGroups)
            .flatMap(dtos -> {
                final DataEntityDetailsDto details = (DataEntityDetailsDto) dtos.get(0);
                return enrichDataEntityDetails(details);
            })
            .flatMap(this::incrementViewCount)
            .flatMap(this::enrichDatasetTargetCount)
            .map(dataEntityMapper::mapDtoDetails);
    }

    @Override
    public Flux<DataEntityRef> listAssociated(final int page, final int size) {
        return authIdentityProvider.fetchAssociatedOwner()
            .flatMapMany(o -> reactiveDataEntityRepository.listByOwner(o.getId(), page, size))
            .map(dataEntityMapper::mapRef);
    }

    @Override
    public Flux<DataEntityRef> listAssociated(final int page,
                                              final int size,
                                              final LineageStreamKind streamKind) {
        return this.getDependentDataEntityOddrns(streamKind)
            .flatMapMany(oddrns -> reactiveDataEntityRepository.listAllByOddrns(oddrns, false, page, size))
            .map(dataEntityMapper::mapRef);
    }

    @Override
    public Mono<List<String>> getDependentDataEntityOddrns(final LineageStreamKind streamKind) {
        return authIdentityProvider.fetchAssociatedOwner()
            .flatMapMany(o -> reactiveDataEntityRepository.listByOwner(o.getId()))
            .map(de -> de.getDataEntity().getOddrn())
            .collect(Collectors.toSet())
            .flatMap(oddrns -> getDependentOddrns(oddrns, streamKind));
    }

    @Override
    public Flux<DataEntityRef> listPopular(final int page, final int size) {
        return reactiveDataEntityRepository.listPopular(page, size)
            .map(dataEntityMapper::mapRef);
    }

    @Override
    public Mono<DataEntityList> listByTerm(final long termId,
                                           final String query,
                                           final Integer entityClassId,
                                           final int page,
                                           final int size) {
        return reactiveDataEntityRepository.listByTerm(termId, query, entityClassId, page, size)
            .collectList()
            .map(dataEntityMapper::mapPojos);
    }

    @Override
    @ReactiveTransactional
    public Mono<MetadataFieldValueList> createMetadata(final long dataEntityId,
                                                       final List<MetadataObject> metadataList) {
        final Map<MetadataKey, MetadataObject> metadataObjectMap = metadataList.stream()
            .collect(Collectors.toMap(MetadataKey::new, identity(), (m1, m2) -> m2));

        final List<MetadataFieldPojo> mfPojos = metadataObjectMap.values()
            .stream()
            .map(metadataFieldMapper::mapObject)
            .collect(Collectors.toList());

        return reactiveDataEntityRepository.get(dataEntityId)
            .switchIfEmpty(Mono.error(new NotFoundException("Data entity", dataEntityId)))
            .then(metadataFieldService.getOrCreateMetadataFields(mfPojos))
            .map(pojos -> pojos.stream().collect(Collectors.toMap(MetadataFieldPojo::getId, identity())))
            .map(fieldsMap -> {
                final List<MetadataFieldValuePojo> metadataFieldValuePojos = fieldsMap.values().stream()
                    .map(metadataFieldPojo -> new MetadataFieldValuePojo()
                        .setMetadataFieldId(metadataFieldPojo.getId())
                        .setValue(metadataObjectMap.get(new MetadataKey(metadataFieldPojo)).getValue())
                        .setDataEntityId(dataEntityId))
                    .toList();
                return Tuples.of(fieldsMap, metadataFieldValuePojos);
            })
            .flatMap(function((fieldsMap, metadataFieldValuePojos) -> reactiveMetadataFieldValueRepository
                .bulkCreateReturning(metadataFieldValuePojos)
                .map(mfv -> {
                    final MetadataFieldPojo metadataFieldPojo = fieldsMap.get(mfv.getMetadataFieldId());
                    return metadataFieldValueMapper.mapDto(new MetadataDto(metadataFieldPojo, mfv));
                })
                .collectList()
                .filter(createdValues -> createdValues.size() == metadataFieldValuePojos.size())
                .switchIfEmpty(Mono.error(new BadUserRequestException("Metadata with this name already exists")))
            ))
            .flatMap(fields -> reactiveSearchEntrypointRepository.updateMetadataVectors(dataEntityId)
                .thenReturn(fields))
            .flatMap(fields -> dataEntityFilledService.markEntityFilled(dataEntityId, INTERNAL_METADATA)
                .thenReturn(fields))
            .map(fields -> new MetadataFieldValueList().items(fields));
    }

    @Override
    @ReactiveTransactional
    public Mono<MetadataFieldValue> upsertMetadataFieldValue(final long dataEntityId,
                                                             final long metadataFieldId,
                                                             final MetadataFieldValueUpdateFormData formData) {
        final MetadataFieldValuePojo metadataFieldValuePojo = new MetadataFieldValuePojo()
            .setDataEntityId(dataEntityId)
            .setMetadataFieldId(metadataFieldId)
            .setValue(formData.getValue());

        return metadataFieldService.get(metadataFieldId)
            .flatMap(fieldPojo -> reactiveMetadataFieldValueRepository.update(metadataFieldValuePojo)
                .map(valuePojo -> Tuples.of(fieldPojo, valuePojo)))
            .flatMap(function((fieldPojo, valuePojo) -> reactiveSearchEntrypointRepository
                .updateMetadataVectors(dataEntityId)
                .thenReturn(Tuples.of(fieldPojo, valuePojo))))
            .map(function(
                (fieldPojo, valuePojo) -> metadataFieldValueMapper.mapDto(new MetadataDto(fieldPojo, valuePojo))));
    }

    @Override
    @ReactiveTransactional
    public Mono<Void> deleteMetadata(final long dataEntityId, final long metadataFieldId) {
        return reactiveMetadataFieldValueRepository.delete(dataEntityId, metadataFieldId)
            .then(reactiveSearchEntrypointRepository.updateMetadataVectors(dataEntityId))
            .thenMany(reactiveMetadataFieldValueRepository.listByDataEntityIds(List.of(dataEntityId), INTERNAL))
            .collectList()
            .flatMap(metadata -> {
                if (CollectionUtils.isEmpty(metadata)) {
                    return dataEntityFilledService.markEntityUnfilled(dataEntityId, INTERNAL_METADATA);
                }
                return Mono.just(metadata);
            })
            .then();
    }

    @Override
    @ActivityLog(event = ActivityEventTypeDto.DESCRIPTION_UPDATED)
    @ReactiveTransactional
    public Mono<InternalDescription> upsertDescription(@ActivityParameter(DATA_ENTITY_ID) final long dataEntityId,
                                                       final InternalDescriptionFormData formData) {
        return reactiveDataEntityRepository.setInternalDescription(dataEntityId, formData.getInternalDescription())
            .map(pojo -> new InternalDescription().internalDescription(pojo.getInternalDescription()))
            .flatMap(in -> reactiveSearchEntrypointRepository.updateDataEntityVectors(dataEntityId)
                .thenReturn(in))
            .flatMap(in -> {
                if (StringUtils.isNotEmpty(in.getInternalDescription())) {
                    return dataEntityFilledService.markEntityFilled(dataEntityId, INTERNAL_DESCRIPTION)
                        .thenReturn(in);
                } else {
                    return dataEntityFilledService.markEntityUnfilled(dataEntityId, INTERNAL_DESCRIPTION)
                        .thenReturn(in);
                }
            });
    }

    @Override
    @ActivityLog(event = ActivityEventTypeDto.BUSINESS_NAME_UPDATED)
    @ReactiveTransactional
    public Mono<InternalName> upsertBusinessName(
        @ActivityParameter(ActivityParameterNames.InternalNameUpdated.DATA_ENTITY_ID) final long dataEntityId,
        final InternalNameFormData formData) {
        return reactiveDataEntityRepository.setInternalName(dataEntityId, formData.getInternalName())
            .map(pojo -> new InternalName().internalName(pojo.getInternalName()))
            .flatMap(in -> reactiveSearchEntrypointRepository.updateDataEntityVectors(dataEntityId)
                .thenReturn(in))
            .flatMap(in -> {
                if (StringUtils.isNotEmpty(in.getInternalName())) {
                    return dataEntityFilledService.markEntityFilled(dataEntityId, INTERNAL_NAME)
                        .thenReturn(in);
                } else {
                    return dataEntityFilledService.markEntityUnfilled(dataEntityId, INTERNAL_NAME)
                        .thenReturn(in);
                }
            });
    }

    @Override
    @ReactiveTransactional
    @ActivityLog(event = ActivityEventTypeDto.TAG_ASSIGNMENT_UPDATED)
    public Flux<Tag> upsertTags(
        @ActivityParameter(ActivityParameterNames.TagsAssociationUpdated.DATA_ENTITY_ID) final long dataEntityId,
        final TagsFormData formData) {
        final Set<String> names = new HashSet<>(formData.getTagNameList());
        return tagService.updateRelationsWithDataEntity(dataEntityId, names)
            .flatMap(tags -> reactiveSearchEntrypointRepository.updateTagVectorsForDataEntity(dataEntityId)
                .thenReturn(tags))
            .flatMap(tags -> {
                final List<TagDto> internalTags = tags.stream()
                    .filter(t -> !t.external())
                    .toList();
                if (CollectionUtils.isEmpty(internalTags)) {
                    return dataEntityFilledService.markEntityUnfilled(dataEntityId, INTERNAL_TAGS).thenReturn(tags);
                } else {
                    return dataEntityFilledService.markEntityFilled(dataEntityId, INTERNAL_TAGS).thenReturn(tags);
                }
            })
            .flatMapIterable(tags -> tags.stream().map(tagMapper::mapToTag).toList());
    }

    @Override
    public Mono<DataEntityList> getDataEntityGroupsChildren(final Long dataEntityGroupId,
                                                            final Integer page,
                                                            final Integer size) {
        return reactiveDataEntityRepository.getDEGExperimentRuns(dataEntityGroupId, page, size)
            .flatMap(this::enrichEntityClassDetails)
            .map(dataEntityMapper::mapPojos);
    }

    @Override
    @ReactiveTransactional
    public Mono<DataEntityRef> addDataEntityToDEG(final Long dataEntityId,
                                                  final DataEntityDataEntityGroupFormData formData) {
        final Mono<DataEntityPojo> dataEntityMono = reactiveDataEntityRepository.get(dataEntityId)
            .switchIfEmpty(Mono.error(new NotFoundException("Data entity", dataEntityId)));
        final Mono<DataEntityPojo> groupPojoMono = reactiveDataEntityRepository.get(formData.getDataEntityGroupId())
            .filter(this::isManuallyCreatedDEG)
            .switchIfEmpty(Mono.error(
                new BadUserRequestException(
                    "Entity with id %s is not manually created DEG".formatted(formData.getDataEntityGroupId()))));
        return dataEntityMono.zipWith(groupPojoMono)
            .flatMap(function(
                (pojo, groupPojo) -> reactiveGroupEntityRelationRepository
                    .createRelationsReturning(groupPojo.getOddrn(), List.of(pojo.getOddrn()))
                    .switchIfEmpty(Mono.error(new BadUserRequestException("Data entity is already in this DEG")))
                    .ignoreElements()
                    .thenReturn(groupPojo)))
            .flatMap(
                groupPojo -> dataEntityFilledService.markEntityFilled(dataEntityId, CUSTOM_GROUP).thenReturn(groupPojo))
            .map(dataEntityMapper::mapRef);
    }

    @Override
    @ReactiveTransactional
    public Flux<GroupEntityRelationsPojo> deleteDataEntityFromDEG(final Long dataEntityId,
                                                                  final Long dataEntityGroupId) {
        final Mono<DataEntityPojo> dataEntityMono = reactiveDataEntityRepository.get(dataEntityId)
            .switchIfEmpty(Mono.error(new NotFoundException("Data entity", dataEntityId)));
        final Mono<DataEntityPojo> groupPojoMono = reactiveDataEntityRepository.get(dataEntityGroupId)
            .filter(this::isManuallyCreatedDEG)
            .switchIfEmpty(Mono.error(
                new BadUserRequestException(
                    "Entity with id %s is not manually created DEG".formatted(dataEntityGroupId))));
        return dataEntityMono.zipWith(groupPojoMono)
            .flatMap(function((pojo, groupPojo) -> reactiveGroupEntityRelationRepository
                .deleteRelationsReturning(groupPojo.getOddrn(), pojo.getOddrn())
                .collectList()
                .map(relations -> Tuples.of(relations, pojo.getOddrn()))
            ))
            .flatMapMany(function((relations, dataEntityOddrn) -> reactiveGroupEntityRelationRepository
                .getManuallyCreatedRelations(dataEntityOddrn)
                .collectList()
                .flatMapMany(groups -> {
                    if (CollectionUtils.isEmpty(groups)) {
                        return dataEntityFilledService.markEntityUnfilled(dataEntityId, CUSTOM_GROUP)
                            .thenMany(Flux.fromIterable(relations));
                    }
                    return Flux.fromIterable(relations);
                }))
            );
    }

    @Override
    public Mono<DataEntityUsageInfo> getDataEntityUsageInfo() {
        return Mono.zip(dataEntityStatisticsRepository.getStatistics(),
                dataEntityFilledService.getFilledDataEntitiesCount())
            .map(function(dataEntityMapper::mapUsageInfo));
    }

    private boolean isManuallyCreatedDEG(final DataEntityPojo pojo) {
        return pojo.getManuallyCreated()
            && ArrayUtils.contains(pojo.getEntityClassIds(), DATA_ENTITY_GROUP.getId());
    }

    private Mono<DataEntityDetailsDto> incrementViewCount(final DataEntityDetailsDto dto) {
        return reactiveDataEntityRepository.incrementViewCount(dto.getDataEntity().getId())
            .map(count -> {
                dto.getDataEntity().setViewCount(count);
                return dto;
            })
            .switchIfEmpty(Mono.just(dto));
    }

    private Mono<Map<String, DataEntityTaskRunPojo>> getLastRunsForQualityTests(
        final List<DataEntityDimensionsDto> dataEntities) {
        final Set<String> qualityTests = entityClassOddrns(dataEntities, DataEntityClassDto.DATA_QUALITY_TEST);
        return reactiveDataEntityTaskRunRepository.getLatestRunsMap(qualityTests);
    }

    private Mono<List<String>> getDependentOddrns(final Set<String> oddrns, final LineageStreamKind streamKind) {
        return reactiveLineageRepository.getLineageRelations(oddrns, LineageDepth.empty(), streamKind)
            .flatMap(lp -> Flux.just(lp.getParentOddrn(), lp.getChildOddrn()))
            .distinct()
            .filter(Predicate.not(oddrns::contains))
            .collectList();
    }

    private Set<String> getSpecificAttributesDependentOddrns(final List<DataEntityDimensionsDto> entities) {
        return entities.stream()
            .map(DataEntityDimensionsDto::getSpecificAttributes)
            .map(Map::values)
            .flatMap(Collection::stream)
            .map(DataEntityAttributes::getDependentOddrns)
            .flatMap(Set::stream)
            .collect(Collectors.toSet());
    }

    private Mono<List<DataEntityDimensionsDto>> enrichEntityClassDetails(
        final List<DataEntityDimensionsDto> dtos) {
        final Set<String> dependentOddrns = getSpecificAttributesDependentOddrns(dtos);

        final Mono<Map<String, DataEntityPojo>> dependencies = reactiveDataEntityRepository
            .listAllByOddrns(dependentOddrns, false)
            .collectMap(DataEntityPojo::getOddrn, identity());
        final Mono<Map<String, DataEntityTaskRunPojo>> lastTaskRuns = getLastRunsForQualityTests(dtos);
        final Mono<Map<String, Set<DataEntityPojo>>> children = getDEGEntities(dtos);
        final Mono<Map<String, Long>> degChildrenCount = getDEGChildrenCount(dtos);

        return Mono.zip(dependencies, lastTaskRuns, children, degChildrenCount)
            .map(function((dependenciesMap, lastTaskRunsMap, childrenMap, degChildrenCountMap) -> {
                dtos.forEach(
                    dto -> enrichEntityClassDetails(dto, dependenciesMap, lastTaskRunsMap, childrenMap,
                        degChildrenCountMap));
                return dtos;
            }));
    }

    private void enrichEntityClassDetails(final DataEntityDimensionsDto dto,
                                          final Map<String, DataEntityPojo> depsRepository,
                                          final Map<String, DataEntityTaskRunPojo> lastRuns,
                                          final Map<String, Set<DataEntityPojo>> childrenMap,
                                          final Map<String, Long> degChildrenCount) {
        final Function<Collection<String>, Collection<DataEntityPojo>> fetcher = oddrns -> oddrns.stream()
            .map(depsRepository::get)
            .filter(Objects::nonNull)
            .collect(toList());
        final String oddrn = dto.getDataEntity().getOddrn();

        dto.getSpecificAttributes().forEach((t, attrs) -> {
            switch (t) {
                case DATA_SET -> {
                    final DataSetAttributes dsa = (DataSetAttributes) attrs;
                    dto.setDataSetDetailsDto(new DataEntityDetailsDto.DataSetDetailsDto(
                        dsa.getRowsCount(),
                        dsa.getFieldsCount(),
                        dsa.getConsumersCount()
                    ));
                }
                case DATA_TRANSFORMER -> {
                    final DataTransformerAttributes dta = (DataTransformerAttributes) attrs;
                    final var dataTransformerDetailsDto = new DataEntityDimensionsDto.DataTransformerDetailsDto(
                        fetcher.apply(dta.getSourceOddrnList()),
                        fetcher.apply(dta.getTargetOddrnList()),
                        dta.getSourceCodeUrl());
                    dto.setDataTransformerDetailsDto(dataTransformerDetailsDto);
                }
                case DATA_QUALITY_TEST -> {
                    final DataQualityTestAttributes dqta = (DataQualityTestAttributes) attrs;
                    final DataEntityTaskRunPojo latestTaskRun = lastRuns.get(oddrn);
                    final var dataQualityTestDetailsDto = new DataEntityDimensionsDto.DataQualityTestDetailsDto(
                        dqta.getSuiteName(),
                        dqta.getSuiteUrl(),
                        fetcher.apply(dqta.getDatasetOddrnList()),
                        dqta.getLinkedUrlList(),
                        dqta.getExpectation().getType(),
                        latestTaskRun,
                        dqta.getExpectation().getAdditionalProperties());
                    dto.setDataQualityTestDetailsDto(dataQualityTestDetailsDto);
                }
                case DATA_CONSUMER -> {
                    final DataConsumerAttributes dca = (DataConsumerAttributes) attrs;
                    dto.setDataConsumerDetailsDto(
                        new DataEntityDimensionsDto.DataConsumerDetailsDto(fetcher.apply(dca.getInputListOddrn())));
                }
                case DATA_INPUT -> {
                    final DataInputAttributes dia = (DataInputAttributes) attrs;
                    dto.setDataInputDetailsDto(
                        new DataEntityDimensionsDto.DataInputDetailsDto(fetcher.apply(dia.getOutputListOddrn())));
                }
                default -> {
                }
            }
        });

        if (ArrayUtils.contains(dto.getDataEntity().getEntityClassIds(), DATA_ENTITY_GROUP.getId())) {
            final Set<DataEntityPojo> entityList = childrenMap.getOrDefault(oddrn, Set.of());
            final Long childrenCount = degChildrenCount.getOrDefault(oddrn, 0L);
            dto.setGroupsDto(new DataEntityDimensionsDto.DataEntityGroupDimensionsDto(
                entityList,
                entityList.size() + childrenCount.intValue(),
                childrenCount != 0L
            ));
        }
    }

    private Mono<List<DataEntityDimensionsDto>> enrichParentGroups(
        final List<DataEntityDimensionsDto> dtos) {
        final Set<String> oddrns = dtos.stream()
            .map(d -> d.getDataEntity().getOddrn())
            .collect(Collectors.toSet());
        return reactiveDataEntityRepository.getParentDEGs(oddrns)
            .map(parents -> {
                dtos.forEach(dto -> dto.setParentGroups(parents.get(dto.getDataEntity().getOddrn())));
                return dtos;
            });
    }

    private Mono<DataEntityDetailsDto> enrichDataEntityDetails(final DataEntityDetailsDto dto) {
        final Mono<List<MetadataDto>> metadataDto =
            reactiveMetadataFieldRepository.getDtosByDataEntityId(dto.getDataEntity().getId());
        final Mono<List<DatasetVersionPojo>> datasetVersions = getDatasetVersions(dto);
        final Mono<List<TermRefDto>> terms =
            reactiveTermRepository.getDataEntityTerms(dto.getDataEntity().getId()).collectList();
        final Mono<List<TagDto>> tags = tagRepository.listDataEntityDtos(dto.getDataEntity().getId());
        return Mono.zip(metadataDto, datasetVersions, terms, tags)
            .map(function((metadata, versions, termsList, tagList) -> {
                dto.setMetadata(metadata);
                dto.setDatasetVersions(versions);
                dto.setTerms(termsList);
                dto.setTags(tagList);
                return dto;
            }));
    }

    private Mono<List<DatasetVersionPojo>> getDatasetVersions(final DataEntityDetailsDto dto) {
        if (!ArrayUtils.contains(dto.getDataEntity().getEntityClassIds(), DataEntityClassDto.DATA_SET.getId())) {
            return Mono.just(List.of());
        }
        return reactiveDatasetVersionRepository.getVersions(dto.getDataEntity().getOddrn());
    }

    private Mono<DataEntityDetailsDto> enrichDatasetTargetCount(final DataEntityDetailsDto detailsDto) {
        if (ArrayUtils.contains(detailsDto.getDataEntity().getEntityClassIds(), DataEntityClassDto.DATA_SET)) {
            return reactiveLineageRepository.getTargetsCount(detailsDto.getDataEntity().getId())
                .switchIfEmpty(Mono.just(0L))
                .map(count -> {
                    final DataSetDetailsDto oldDetails = detailsDto.getDataSetDetailsDto();
                    detailsDto.setDataSetDetailsDto(
                        new DataSetDetailsDto(oldDetails.rowsCount(), oldDetails.fieldsCount(), count));
                    return detailsDto;
                });
        }
        return Mono.just(detailsDto);
    }

    private Mono<Map<String, Set<DataEntityPojo>>> getDEGEntities(final Collection<DataEntityDimensionsDto> dtos) {
        final Set<String> degOddrns = entityClassOddrns(dtos, DATA_ENTITY_GROUP);
        if (degOddrns.isEmpty()) {
            return Mono.just(Map.of());
        }
        return reactiveDataEntityRepository.getDEGEntities(degOddrns);
    }

    private Mono<Map<String, Long>> getDEGChildrenCount(final Collection<DataEntityDimensionsDto> dtos) {
        final Set<String> degOddrns = entityClassOddrns(dtos, DATA_ENTITY_GROUP);
        if (degOddrns.isEmpty()) {
            return Mono.just(Map.of());
        }
        return reactiveDataEntityRepository.getChildrenCount(degOddrns);
    }

    private Set<String> entityClassOddrns(final Collection<DataEntityDimensionsDto> dimensions,
                                          final DataEntityClassDto entityClassDto) {
        return dimensions.stream()
            .filter(dto -> ArrayUtils.contains(dto.getDataEntity().getEntityClassIds(), entityClassDto.getId()))
            .map(dto -> dto.getDataEntity().getOddrn())
            .collect(Collectors.toSet());
    }
}
