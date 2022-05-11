package org.opendatadiscovery.oddplatform.service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ArrayUtils;
import org.opendatadiscovery.oddplatform.annotation.BlockingTransactional;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityClassAndTypeDictionary;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGroupLineageList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineage;
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
import org.opendatadiscovery.oddplatform.dto.LineageStreamKind;
import org.opendatadiscovery.oddplatform.dto.MetadataDto;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataKey;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.DataEntityMapper;
import org.opendatadiscovery.oddplatform.mapper.MetadataFieldMapper;
import org.opendatadiscovery.oddplatform.mapper.MetadataFieldValueMapper;
import org.opendatadiscovery.oddplatform.mapper.TagMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldValuePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagToDataEntityPojo;
import org.opendatadiscovery.oddplatform.repository.DataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.LineageRepository;
import org.opendatadiscovery.oddplatform.repository.MetadataFieldRepository;
import org.opendatadiscovery.oddplatform.repository.MetadataFieldValueRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto.DataSetDetailsDto;

@Service
@Slf4j
public class DataEntityServiceImpl
    extends AbstractReadOnlyCRUDService<DataEntity, DataEntityList,
    DataEntityDimensionsDto, DataEntityMapper, DataEntityRepository>
    implements DataEntityService {

    private final AuthIdentityProvider authIdentityProvider;
    private final MetadataFieldValueRepository metadataFieldValueRepository;
    private final MetadataFieldRepository metadataFieldRepository;
    private final TagService tagService;
    private final LineageRepository lineageRepository;
    private final MetadataFieldMapper metadataFieldMapper;
    private final MetadataFieldValueMapper metadataFieldValueMapper;
    private final TagMapper tagMapper;
    private final ReactiveSearchEntrypointRepository reactiveSearchEntrypointRepository;

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
                                 final TagMapper tagMapper) {
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

        return tagService.deleteRelationsWithDataEntityExcept(dataEntityId, names)
            .then(tagService.getOrCreateTagsByName(names))
            .flatMap(tagsToLink -> tagService.createRelationsWithDataEntity(dataEntityId, tagsToLink)
                .ignoreElements().thenReturn(tagsToLink))
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
    public Mono<DataEntityLineage> getLineage(final long dataEntityId,
                                              final int lineageDepth,
                                              final LineageStreamKind lineageStreamKind) {
        return Mono
            .fromCallable(() -> entityRepository.getLineage(dataEntityId, lineageDepth, lineageStreamKind))
            .flatMap(optional -> optional.isEmpty()
                ? Mono.error(new NotFoundException())
                : Mono.just(optional.get()))
            .map(entityMapper::mapLineageDto);
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
    public Mono<DataEntityGroupLineageList> getDataEntityGroupLineage(final Long dataEntityGroupId) {
        return Mono.fromCallable(() -> entityRepository.getDataEntityGroupLineage(dataEntityGroupId))
            .flatMap(optional -> optional.isEmpty()
                ? Mono.error(new NotFoundException())
                : Mono.just(optional.get()))
            .map(entityMapper::mapGroupLineageDto);
    }
}
