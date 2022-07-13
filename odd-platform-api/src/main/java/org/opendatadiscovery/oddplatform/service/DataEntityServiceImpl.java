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
import org.opendatadiscovery.oddplatform.annotation.BlockingTransactional;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityClassAndTypeDictionary;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDataEntityGroupFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGroupFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
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
import org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataDto;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataKey;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
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
import org.opendatadiscovery.oddplatform.repository.MetadataFieldRepository;
import org.opendatadiscovery.oddplatform.repository.MetadataFieldValueRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveGroupEntityRelationRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnershipRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.opendatadiscovery.oddrn.Generator;
import org.opendatadiscovery.oddrn.model.ODDPlatformDataEntityGroupPath;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_ENTITY_GROUP;
import static org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto.DataSetDetailsDto;
import static reactor.function.TupleUtils.function;

@Service
@Slf4j
public class DataEntityServiceImpl
    extends AbstractReadOnlyCRUDService<DataEntity, DataEntityList,
    DataEntityDimensionsDto, DataEntityMapper, DataEntityRepository>
    implements DataEntityService {
    private final Generator oddrnGenerator = new Generator();

    private final AuthIdentityProvider authIdentityProvider;
    private final MetadataFieldValueRepository metadataFieldValueRepository;
    private final ReactiveDataEntityRepository reactiveDataEntityRepository;
    private final MetadataFieldRepository metadataFieldRepository;
    private final TagService tagService;
    private final LineageRepository lineageRepository;
    private final NamespaceService namespaceService;

    private final MetadataFieldMapper metadataFieldMapper;
    private final MetadataFieldValueMapper metadataFieldValueMapper;
    private final TagMapper tagMapper;
    private final ReactiveSearchEntrypointRepository reactiveSearchEntrypointRepository;
    private final ReactiveGroupEntityRelationRepository reactiveGroupEntityRelationRepository;
    private final ReactiveTermRepository reactiveTermRepository;
    private final ReactiveOwnershipRepository ownershipRepository;

    public DataEntityServiceImpl(final DataEntityMapper entityMapper,
                                 final DataEntityRepository entityRepository,
                                 final AuthIdentityProvider authIdentityProvider,
                                 final MetadataFieldValueRepository metadataFieldValueRepository,
                                 final MetadataFieldRepository metadataFieldRepository,
                                 final TagService tagService,
                                 final LineageRepository lineageRepository,
                                 final MetadataFieldMapper metadataFieldMapper,
                                 final MetadataFieldValueMapper metadataFieldValueMapper,
                                 final ReactiveSearchEntrypointRepository reactiveSearchEntrypointRepository,
                                 final TagMapper tagMapper,
                                 final NamespaceService namespaceService,
                                 final ReactiveDataEntityRepository reactiveDataEntityRepository,
                                 final ReactiveGroupEntityRelationRepository reactiveGroupEntityRelationRepository,
                                 final ReactiveTermRepository reactiveTermRepository,
                                 final ReactiveOwnershipRepository ownershipRepository) {
        super(entityMapper, entityRepository);

        this.authIdentityProvider = authIdentityProvider;
        this.metadataFieldValueRepository = metadataFieldValueRepository;
        this.metadataFieldRepository = metadataFieldRepository;
        this.tagService = tagService;
        this.lineageRepository = lineageRepository;
        this.metadataFieldMapper = metadataFieldMapper;
        this.metadataFieldValueMapper = metadataFieldValueMapper;
        this.reactiveSearchEntrypointRepository = reactiveSearchEntrypointRepository;
        this.tagMapper = tagMapper;
        this.namespaceService = namespaceService;
        this.reactiveDataEntityRepository = reactiveDataEntityRepository;
        this.reactiveTermRepository = reactiveTermRepository;
        this.ownershipRepository = ownershipRepository;
        this.reactiveGroupEntityRelationRepository = reactiveGroupEntityRelationRepository;
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
    public Mono<DataEntityRef> updateDataEntityGroup(final Long id, final DataEntityGroupFormData formData) {
        return reactiveDataEntityRepository.get(id)
            .doOnNext(pojo -> log.info("I'm here"))
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
    public Mono<DataEntityPojo> deleteDataEntityGroup(final Long id) {
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
            .flatMapIterable(o -> entityRepository.listByOwner(page, size, o.getId(), streamKind))
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
    @BlockingTransactional
    public Mono<MetadataFieldValueList> createMetadata(final long dataEntityId,
                                                       final List<MetadataObject> metadataList) {
        final Map<MetadataKey, MetadataObject> metadataObjectMap = metadataList.stream()
            .collect(Collectors.toMap(MetadataKey::new, identity(), (m1, m2) -> m2));

        final List<MetadataFieldPojo> mfPojos = metadataObjectMap.values()
            .stream()
            .map(metadataFieldMapper::mapObject)
            .collect(Collectors.toList());

        final Map<Long, MetadataFieldPojo> metadataFields = metadataFieldRepository
            .createIfNotExist(mfPojos)
            .stream()
            .collect(Collectors.toMap(MetadataFieldPojo::getId, identity()));

        final List<MetadataFieldValuePojo> mfvPojos = metadataFields.values().stream()
            .map(metadataFieldPojo -> new MetadataFieldValuePojo()
                .setMetadataFieldId(metadataFieldPojo.getId())
                .setValue(metadataObjectMap.get(new MetadataKey(metadataFieldPojo)).getValue())
                .setDataEntityId(dataEntityId))
            .toList();

        final List<MetadataFieldValue> fields = metadataFieldValueRepository
            .bulkCreate(mfvPojos)
            .stream()
            .map(mfv -> {
                final MetadataFieldPojo metadataFieldPojo = metadataFields.get(mfv.getMetadataFieldId());
                return metadataFieldValueMapper.mapDto(new MetadataDto(metadataFieldPojo, mfv));
            })
            .collect(Collectors.toList());

        entityRepository.calculateMetadataVectors(List.of(dataEntityId));
        return Mono.just(new MetadataFieldValueList().items(fields));
    }

    @Override
    public Mono<Void> deleteMetadata(final long dataEntityId, final long metadataFieldId) {
        return Mono
            .fromRunnable(() -> metadataFieldValueRepository.delete(dataEntityId, metadataFieldId))
            .then();
    }

    @Override
    public Mono<InternalDescription> upsertDescription(final long dataEntityId,
                                                       final InternalDescriptionFormData formData) {
        return Mono.just(formData.getInternalDescription()).map(d -> {
            entityRepository.setDescription(dataEntityId, d);
            return new InternalDescription().internalDescription(d);
        });
    }

    @Override
    public Mono<InternalName> upsertBusinessName(final long dataEntityId,
                                                 final InternalNameFormData formData) {
        return Mono.just(formData.getInternalName())
            .map(name -> {
                entityRepository.setInternalName(dataEntityId, name);
                return new InternalName().internalName(name);
            });
    }

    @Override
    @ReactiveTransactional
    public Flux<Tag> upsertTags(final long dataEntityId, final TagsFormData formData) {
        final Set<String> names = new HashSet<>(formData.getTagNameList());
        return tagService.updateRelationsWithDataEntity(dataEntityId, names)
            .flatMap(tags -> reactiveSearchEntrypointRepository.updateTagVectorsForDataEntity(dataEntityId)
                .thenReturn(tags))
            .flatMapIterable(tags -> tags.stream().map(tagMapper::mapToTag).toList());
    }

    @Override
    @BlockingTransactional
    public Mono<MetadataFieldValue> upsertMetadataFieldValue(final long dataEntityId,
                                                             final long metadataFieldId,
                                                             final MetadataFieldValueUpdateFormData formData) {
        final MetadataFieldValuePojo metadataFieldValuePojo = new MetadataFieldValuePojo()
            .setDataEntityId(dataEntityId)
            .setMetadataFieldId(metadataFieldId)
            .setValue(formData.getValue());

        final MetadataFieldPojo metadataFieldPojo = metadataFieldRepository.get(metadataFieldId)
            .orElseThrow(NotFoundException::new);

        final MetadataFieldValuePojo enrichedPojo = metadataFieldValueRepository.update(metadataFieldValuePojo);
        entityRepository.calculateMetadataVectors(List.of(dataEntityId));

        return Mono.just(metadataFieldValueMapper.mapDto(new MetadataDto(metadataFieldPojo, enrichedPojo)));
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
                    .createRelations(groupPojo.getOddrn(), List.of(pojo.getOddrn()))
                    .ignoreElements()
                    .thenReturn(groupPojo)
            )).map(entityMapper::mapRef);
    }

    @Override
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
            .flatMapMany(function(
                (pojo, groupPojo) -> reactiveGroupEntityRelationRepository
                    .deleteRelations(groupPojo.getOddrn(), pojo.getOddrn())
            ));
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
                return reactiveGroupEntityRelationRepository.createRelations(pojo.getOddrn(), entityOddrns)
                    .ignoreElements().thenReturn(pojo);
            })
            .flatMap(this::updateSearchVectors)
            .map(entityMapper::mapRef);
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
            .flatMap(degPojo -> reactiveGroupEntityRelationRepository.createRelations(degPojo.getOddrn(), entityOddrns)
                .ignoreElements().thenReturn(degPojo))
            .flatMap(this::updateSearchVectors)
            .map(entityMapper::mapRef);
    }

    private Mono<DataEntityPojo> deleteDEG(final DataEntityPojo pojo) {
        return Flux.zip(
            reactiveTermRepository.deleteRelationsWithTerms(pojo.getId()),
            reactiveGroupEntityRelationRepository.deleteRelationsForDEG(pojo.getOddrn()),
            tagService.deleteRelationsForDataEntity(pojo.getId()),
            ownershipRepository.deleteByDataEntityId(pojo.getId())
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

    private boolean isManuallyCreatedDEG(final DataEntityPojo pojo) {
        return pojo.getManuallyCreated()
            && ArrayUtils.contains(pojo.getEntityClassIds(), DATA_ENTITY_GROUP.getId());
    }
}
