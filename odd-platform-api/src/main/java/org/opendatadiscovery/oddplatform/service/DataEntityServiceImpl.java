package org.opendatadiscovery.oddplatform.service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityClassAndTypeDictionary;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDataEntityGroupFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGroupFormData;
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
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.TagDto;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityCreateEvent;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataDto;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataKey;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.CompactDataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.CompactDataEntityList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.mapper.DataEntityMapper;
import org.opendatadiscovery.oddplatform.mapper.MetadataFieldMapper;
import org.opendatadiscovery.oddplatform.mapper.MetadataFieldValueMapper;
import org.opendatadiscovery.oddplatform.mapper.TagMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GroupEntityRelationsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldValuePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.repository.DataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.LineageRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityStatisticsRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveGroupEntityRelationRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveMetadataFieldValueRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnershipRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.opendatadiscovery.oddplatform.service.activity.ActivityLog;
import org.opendatadiscovery.oddplatform.service.activity.ActivityParameter;
import org.opendatadiscovery.oddplatform.service.activity.ActivityService;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames;
import org.opendatadiscovery.oddrn.Generator;
import org.opendatadiscovery.oddrn.model.ODDPlatformDataEntityGroupPath;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuples;

import static java.util.function.Function.identity;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_ENTITY_GROUP;
import static org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto.DataSetDetailsDto;
import static org.opendatadiscovery.oddplatform.dto.DataEntityFilledField.CUSTOM_GROUP;
import static org.opendatadiscovery.oddplatform.dto.DataEntityFilledField.INTERNAL_DESCRIPTION;
import static org.opendatadiscovery.oddplatform.dto.DataEntityFilledField.INTERNAL_METADATA;
import static org.opendatadiscovery.oddplatform.dto.DataEntityFilledField.INTERNAL_NAME;
import static org.opendatadiscovery.oddplatform.dto.DataEntityFilledField.INTERNAL_TAGS;
import static org.opendatadiscovery.oddplatform.dto.DataEntityFilledField.MANUALLY_CREATED;
import static org.opendatadiscovery.oddplatform.dto.metadata.MetadataOrigin.INTERNAL;
import static org.opendatadiscovery.oddplatform.utils.ActivityParameterNames.DescriptionUpdated.DATA_ENTITY_ID;
import static reactor.function.TupleUtils.function;

@Service
@Slf4j
public class DataEntityServiceImpl
    extends AbstractReadOnlyCRUDService<DataEntity, DataEntityList,
    DataEntityDimensionsDto, DataEntityMapper, DataEntityRepository>
    implements DataEntityService {
    private final Generator oddrnGenerator = new Generator();

    private final AuthIdentityProvider authIdentityProvider;
    private final ReactiveMetadataFieldValueRepository reactiveMetadataFieldValueRepository;
    private final ReactiveDataEntityRepository reactiveDataEntityRepository;
    private final TagService tagService;
    private final LineageRepository lineageRepository;
    private final NamespaceService namespaceService;
    private final ActivityService activityService;

    private final MetadataFieldMapper metadataFieldMapper;
    private final MetadataFieldValueMapper metadataFieldValueMapper;
    private final TagMapper tagMapper;
    private final ReactiveSearchEntrypointRepository reactiveSearchEntrypointRepository;
    private final ReactiveGroupEntityRelationRepository reactiveGroupEntityRelationRepository;
    private final ReactiveTermRepository reactiveTermRepository;
    private final ReactiveOwnershipRepository ownershipRepository;
    private final ReactiveDataEntityStatisticsRepository dataEntityStatisticsRepository;
    private final DataEntityFilledService dataEntityFilledService;
    private final MetadataFieldService metadataFieldService;

    public DataEntityServiceImpl(final DataEntityMapper entityMapper,
                                 final DataEntityRepository entityRepository,
                                 final AuthIdentityProvider authIdentityProvider,
                                 final ReactiveMetadataFieldValueRepository reactiveMetadataFieldValueRepository,
                                 final TagService tagService,
                                 final LineageRepository lineageRepository,
                                 final MetadataFieldMapper metadataFieldMapper,
                                 final MetadataFieldValueMapper metadataFieldValueMapper,
                                 final ReactiveSearchEntrypointRepository reactiveSearchEntrypointRepository,
                                 final TagMapper tagMapper,
                                 final NamespaceService namespaceService,
                                 final ActivityService activityService,
                                 final ReactiveDataEntityRepository reactiveDataEntityRepository,
                                 final ReactiveGroupEntityRelationRepository reactiveGroupEntityRelationRepository,
                                 final ReactiveTermRepository reactiveTermRepository,
                                 final ReactiveOwnershipRepository ownershipRepository,
                                 final ReactiveDataEntityStatisticsRepository dataEntityStatisticsRepository,
                                 final DataEntityFilledService dataEntityFilledService,
                                 final MetadataFieldService metadataFieldService) {
        super(entityMapper, entityRepository);

        this.authIdentityProvider = authIdentityProvider;
        this.reactiveMetadataFieldValueRepository = reactiveMetadataFieldValueRepository;
        this.tagService = tagService;
        this.lineageRepository = lineageRepository;
        this.metadataFieldMapper = metadataFieldMapper;
        this.metadataFieldValueMapper = metadataFieldValueMapper;
        this.reactiveSearchEntrypointRepository = reactiveSearchEntrypointRepository;
        this.tagMapper = tagMapper;
        this.namespaceService = namespaceService;
        this.activityService = activityService;
        this.reactiveDataEntityRepository = reactiveDataEntityRepository;
        this.reactiveTermRepository = reactiveTermRepository;
        this.ownershipRepository = ownershipRepository;
        this.reactiveGroupEntityRelationRepository = reactiveGroupEntityRelationRepository;
        this.dataEntityStatisticsRepository = dataEntityStatisticsRepository;
        this.dataEntityFilledService = dataEntityFilledService;
        this.metadataFieldService = metadataFieldService;
    }

    @Override
    @ReactiveTransactional
    public Mono<DataEntityRef> createDataEntityGroup(final DataEntityGroupFormData formData) {
        if (StringUtils.isNotEmpty(formData.getNamespaceName())) {
            return namespaceService.getOrCreate(formData.getNamespaceName())
                .flatMap(namespacePojo -> createDEG(formData, namespacePojo));
        } else {
            return createDEG(formData, null);
        }
    }

    @Override
    @ReactiveTransactional
    @ActivityLog(event = ActivityEventTypeDto.CUSTOM_GROUP_UPDATED)
    public Mono<DataEntityRef> updateDataEntityGroup(
        @ActivityParameter(ActivityParameterNames.CustomGroupUpdated.DATA_ENTITY_ID) final Long id,
        final DataEntityGroupFormData formData) {
        return reactiveDataEntityRepository.get(id)
            .switchIfEmpty(Mono.error(new NotFoundException("Data entity group with id %s doesn't exist", id)))
            .filter(DataEntityPojo::getManuallyCreated)
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Can't update ingested data entity")))
            .flatMap(pojo -> {
                if (StringUtils.isNotEmpty(formData.getNamespaceName())) {
                    return namespaceService.getOrCreate(formData.getNamespaceName())
                        .flatMap(namespacePojo -> updateDEG(pojo, formData, namespacePojo));
                } else {
                    return updateDEG(pojo, formData, null);
                }
            });
    }

    @Override
    @ActivityLog(event = ActivityEventTypeDto.CUSTOM_GROUP_DELETED)
    public Mono<DataEntityPojo> deleteDataEntityGroup(
        @ActivityParameter(ActivityParameterNames.CustomGroupDeleted.DATA_ENTITY_ID) final Long id) {
        return reactiveDataEntityRepository.get(id)
            .switchIfEmpty(Mono.error(new NotFoundException("Data entity group with id %s doesn't exist", id)))
            .filter(DataEntityPojo::getManuallyCreated)
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Can't delete ingested data entity")))
            .flatMap(this::deleteDEG);
    }

    @Override
    public Mono<DataEntityClassAndTypeDictionary> getDataEntityClassesAndTypes() {
        return Mono.just(entityMapper.getTypeDict());
    }

    @Override
    public Mono<DataEntityDetails> getDetails(final long dataEntityId) {
        return Mono
            .fromCallable(() -> entityRepository.getDetails(dataEntityId))
            .flatMap(optional -> optional.isEmpty()
                ? Mono.error(new NotFoundException())
                : Mono.just(optional.get()))
            .map(this::incrementViewCount)
            .map(dto -> {
                if (ArrayUtils.contains(dto.getDataEntity().getEntityClassIds(), DataEntityClassDto.DATA_SET)) {
                    final Long targetCount = lineageRepository.getTargetsCount(dataEntityId).orElse(0L);

                    final DataSetDetailsDto oldDetails = dto.getDataSetDetailsDto();
                    dto.setDataSetDetailsDto(
                        new DataSetDetailsDto(oldDetails.rowsCount(), oldDetails.fieldsCount(), targetCount));
                }

                return dto;
            })
            .map(entityMapper::mapDtoDetails);
    }

    private DataEntityDetailsDto incrementViewCount(final DataEntityDetailsDto dto) {
        final DataEntityPojo dataEntity = dto.getDataEntity();
        final Optional<Long> viewCount = entityRepository.incrementViewCount(dataEntity.getId());
        viewCount.ifPresent(dataEntity::setViewCount);
        return dto;
    }

    @Override
    public Mono<DataEntityList> list(final Integer page,
                                     final Integer size,
                                     final int entityClassId,
                                     final Integer entityTypeId) {
        return Mono
            .fromCallable(() -> entityRepository.listByEntityClass(page, size, entityClassId, entityTypeId))
            .map(entityMapper::mapPojos);
    }

    @Override
    public Flux<DataEntityRef> listAssociated(final int page, final int size) {
        return authIdentityProvider.fetchAssociatedOwner()
            .flatMapIterable(o -> entityRepository.listByOwner(page, size, o.getId()))
            .map(entityMapper::mapRef);
    }

    @Override
    public Flux<DataEntityRef> listAssociated(final int page,
                                              final int size,
                                              final LineageStreamKind streamKind) {
        return authIdentityProvider.fetchAssociatedOwner()
            .flatMapIterable(o -> {
                    final List<String> oddrns = entityRepository
                        .listOddrnsByOwner(o.getId(), streamKind);
                    return entityRepository.listAllByOddrns(oddrns, page, size, true);
                }
            )
            .map(entityMapper::mapRef);
    }

    @Override
    public Flux<DataEntityRef> listPopular(final int page, final int size) {
        return Flux
            .fromIterable(entityRepository.listPopular(page, size))
            .map(entityMapper::mapRef);
    }

    @Override
    public Mono<DataEntityList> listByTerm(final long termId, final String query, final Integer entityClassId,
                                           final int page, final int size) {
        return Mono
            .fromCallable(() -> entityRepository.listByTerm(termId, query, entityClassId, page, size))
            .map(entityMapper::mapPojos);
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

        return metadataFieldService.getOrCreateMetadataFields(mfPojos)
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
                }).collectList()))
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
    @ActivityLog(event = ActivityEventTypeDto.TAGS_ASSOCIATION_UPDATED)
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
        return Mono.fromCallable(() -> entityRepository
                .getDataEntityGroupsChildren(dataEntityGroupId, page, size))
            .map(entityMapper::mapPojos);
    }

    @Override
    @ReactiveTransactional
    public Mono<DataEntityRef> addDataEntityToDEG(final Long dataEntityId,
                                                  final DataEntityDataEntityGroupFormData formData) {
        final Mono<DataEntityPojo> dataEntityMono = reactiveDataEntityRepository.get(dataEntityId)
            .switchIfEmpty(Mono.error(new NotFoundException("Data entity with id %s doesn't exist", dataEntityId)));
        final Mono<DataEntityPojo> groupPojoMono = reactiveDataEntityRepository.get(formData.getDataEntityGroupId())
            .filter(this::isManuallyCreatedDEG)
            .switchIfEmpty(Mono.error(
                new IllegalArgumentException(
                    "Entity with id %s is not manually created DEG".formatted(formData.getDataEntityGroupId()))));
        return dataEntityMono.zipWith(groupPojoMono)
            .flatMap(function(
                (pojo, groupPojo) -> reactiveGroupEntityRelationRepository
                    .createRelationsReturning(groupPojo.getOddrn(), List.of(pojo.getOddrn()))
                    .ignoreElements()
                    .thenReturn(groupPojo)))
            .flatMap(
                groupPojo -> dataEntityFilledService.markEntityFilled(dataEntityId, CUSTOM_GROUP).thenReturn(groupPojo))
            .map(entityMapper::mapRef);
    }

    @Override
    @ReactiveTransactional
    public Flux<GroupEntityRelationsPojo> deleteDataEntityFromDEG(final Long dataEntityId,
                                                                  final Long dataEntityGroupId) {
        final Mono<DataEntityPojo> dataEntityMono = reactiveDataEntityRepository.get(dataEntityId)
            .switchIfEmpty(Mono.error(new NotFoundException("Data entity with id %s doesn't exist", dataEntityId)));
        final Mono<DataEntityPojo> groupPojoMono = reactiveDataEntityRepository.get(dataEntityGroupId)
            .filter(this::isManuallyCreatedDEG)
            .switchIfEmpty(Mono.error(
                new IllegalArgumentException(
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
            .map(function(entityMapper::mapUsageInfo));
    }

    @Override
    public Mono<CompactDataEntityList> listEntitiesWithinDEG(final String degOddrn) {
        return reactiveDataEntityRepository.getDEGEntities(degOddrn)
            .map(entityList -> entityList
                .stream()
                .map(de -> new CompactDataEntity()
                    .oddrn(de.getOddrn())
                    .type(DataEntityType.fromValue(DataEntityTypeDto.findById(de.getTypeId()).toString())))
                .toList())
            .map(entityList -> new CompactDataEntityList().items(entityList));
    }

    private Mono<DataEntityRef> createDEG(final DataEntityGroupFormData formData,
                                          final NamespacePojo namespace) {
        return Mono.just(formData)
            .map(fd -> entityMapper.mapToPojo(fd, DATA_ENTITY_GROUP, namespace))
            .flatMap(reactiveDataEntityRepository::create)
            .map(pojo -> {
                final String oddrn = generateOddrn(pojo);
                pojo.setOddrn(oddrn);
                return pojo;
            })
            .flatMap(reactiveDataEntityRepository::update)
            .flatMap(pojo -> {
                final List<String> entityOddrns =
                    formData.getEntities().stream().map(DataEntityRef::getOddrn).toList();
                return reactiveGroupEntityRelationRepository.createRelationsReturning(pojo.getOddrn(), entityOddrns)
                    .ignoreElements().thenReturn(pojo);
            })
            .flatMap(this::updateSearchVectors)
            .map(entityMapper::mapRef)
            .flatMap(ref -> logDEGCreatedActivityEvent(ref).thenReturn(ref))
            .flatMap(ref -> dataEntityFilledService.markEntityFilled(ref.getId(), MANUALLY_CREATED).thenReturn(ref))
            .flatMap(ref -> dataEntityStatisticsRepository.updateCounts(1L, Map.of(DATA_ENTITY_GROUP, 1L))
                .thenReturn(ref));
    }

    private Mono<DataEntityRef> updateDEG(final DataEntityPojo pojo,
                                          final DataEntityGroupFormData formData,
                                          final NamespacePojo namespace) {
        final List<String> entityOddrns =
            formData.getEntities().stream().map(DataEntityRef::getOddrn).toList();
        return Mono.just(formData)
            .map(fd -> entityMapper.applyToPojo(fd, namespace, pojo))
            .flatMap(reactiveDataEntityRepository::update)
            .flatMap(degPojo -> reactiveGroupEntityRelationRepository
                .deleteRelationsExcept(degPojo.getOddrn(), entityOddrns).ignoreElements().thenReturn(degPojo))
            .flatMap(degPojo -> reactiveGroupEntityRelationRepository
                .createRelationsReturning(degPojo.getOddrn(), entityOddrns)
                .ignoreElements().thenReturn(degPojo))
            .flatMap(this::updateSearchVectors)
            .map(entityMapper::mapRef);
    }

    private Mono<DataEntityPojo> deleteDEG(final DataEntityPojo pojo) {
        return Flux.zip(
            dataEntityStatisticsRepository.updateCounts(-1L, Map.of(DATA_ENTITY_GROUP, -1L)),
            reactiveTermRepository.deleteRelationsWithTerms(pojo.getId()),
            reactiveGroupEntityRelationRepository.deleteRelationsForDEG(pojo.getOddrn()),
            tagService.deleteRelationsForDataEntity(pojo.getId()),
            ownershipRepository.deleteByDataEntityId(pojo.getId()),
            dataEntityFilledService.markEntityUnfilled(pojo.getId(), MANUALLY_CREATED)
        ).then(reactiveDataEntityRepository.delete(pojo.getId()));
    }

    private String generateOddrn(final DataEntityPojo pojo) {
        try {
            return oddrnGenerator.generate(ODDPlatformDataEntityGroupPath.builder()
                .id(pojo.getId())
                .build(), "id");
        } catch (Exception e) {
            log.error("Error while generating oddrn for data entity {}", pojo.getId(), e);
            throw new RuntimeException(e);
        }
    }

    private Mono<DataEntityPojo> updateSearchVectors(final DataEntityPojo pojo) {
        return Mono.zip(
            reactiveSearchEntrypointRepository.updateDataEntityVectors(pojo.getId()),
            reactiveSearchEntrypointRepository.updateNamespaceVectorForDataEntity(pojo.getId())
        ).thenReturn(pojo);
    }

    private Mono<Void> logDEGCreatedActivityEvent(final DataEntityRef ref) {
        return Mono.zip(activityService.getContextInfo(Map.of(), ActivityEventTypeDto.CUSTOM_GROUP_CREATED),
                activityService.getUpdatedInfo(Map.of(), ref.getId(), ActivityEventTypeDto.CUSTOM_GROUP_CREATED))
            .map(function((ci, newState) -> ActivityCreateEvent.builder()
                .dataEntityId(ref.getId())
                .oldState(ci.getOldState())
                .newState(newState)
                .eventType(ActivityEventTypeDto.CUSTOM_GROUP_CREATED)
                .systemEvent(false)
                .build()
            )).flatMap(activityService::createActivityEvent);
    }

    private boolean isManuallyCreatedDEG(final DataEntityPojo pojo) {
        return pojo.getManuallyCreated()
            && ArrayUtils.contains(pojo.getEntityClassIds(), DATA_ENTITY_GROUP.getId());
    }
}
