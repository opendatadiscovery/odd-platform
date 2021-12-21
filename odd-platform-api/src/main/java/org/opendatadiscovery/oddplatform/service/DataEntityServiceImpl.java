package org.opendatadiscovery.oddplatform.service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ArrayUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGroupLineageList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineage;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityTagsFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityTypeDictionary;
import org.opendatadiscovery.oddplatform.api.contract.model.InternalDescription;
import org.opendatadiscovery.oddplatform.api.contract.model.InternalDescriptionFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.InternalName;
import org.opendatadiscovery.oddplatform.api.contract.model.InternalNameFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataField;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldOrigin;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldType;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldValue;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldValueList;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldValueUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataObject;
import org.opendatadiscovery.oddplatform.api.contract.model.Tag;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.LineageStreamKind;
import org.opendatadiscovery.oddplatform.dto.MetadataFieldKey;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.DataEntityMapper;
import org.opendatadiscovery.oddplatform.mapper.MetadataFieldMapper;
import org.opendatadiscovery.oddplatform.mapper.TagMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldValuePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.repository.DataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.LineageRepository;
import org.opendatadiscovery.oddplatform.repository.MetadataFieldRepository;
import org.opendatadiscovery.oddplatform.repository.MetadataFieldValueRepository;
import org.opendatadiscovery.oddplatform.repository.TagRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.function.Predicate.not;
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
    private final TagRepository tagRepository;
    private final LineageRepository lineageRepository;

    private final MetadataFieldMapper metadataFieldMapper;
    private final TagMapper tagMapper;

    public DataEntityServiceImpl(final DataEntityMapper entityMapper,
                                 final DataEntityRepository entityRepository,
                                 final AuthIdentityProvider authIdentityProvider,
                                 final MetadataFieldValueRepository metadataFieldValueRepository,
                                 final MetadataFieldRepository metadataFieldRepository,
                                 final TagRepository tagRepository,
                                 final LineageRepository lineageRepository,
                                 final MetadataFieldMapper metadataFieldMapper,
                                 final TagMapper tagMapper) {
        super(entityMapper, entityRepository);

        this.authIdentityProvider = authIdentityProvider;
        this.metadataFieldValueRepository = metadataFieldValueRepository;
        this.metadataFieldRepository = metadataFieldRepository;
        this.tagRepository = tagRepository;
        this.lineageRepository = lineageRepository;
        this.metadataFieldMapper = metadataFieldMapper;
        this.tagMapper = tagMapper;
    }

    @Override
    public Mono<DataEntityTypeDictionary> getDataEntityTypes() {
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
                if (ArrayUtils.contains(dto.getDataEntity().getTypeIds(), DataEntityTypeDto.DATA_SET)) {
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
                                     final int entityType,
                                     final Integer entitySubType) {
        return Mono
            .fromCallable(() -> entityRepository.listByType(page, size, entityType, entitySubType))
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
    // TODO: refactor
    // TODO: fix non-transactional update of search entrypoint
    public Mono<MetadataFieldValueList> createMetadata(final long dataEntityId,
                                                       final List<MetadataObject> metadataList) {
        return Mono.just(metadataList)
            .map(ml -> ml.stream()
                .collect(Collectors.toMap(
                    mo -> new MetadataFieldKey(mo.getName(), mo.getType()),
                    Function.identity(),
                    (m1, m2) -> m2))
            )
            .map(mg -> {
                final List<MetadataFieldPojo> mfPojos = mg.values()
                    .stream()
                    .map(m -> new MetadataFieldPojo().setName(m.getName()).setType(m.getType()))
                    .collect(Collectors.toList());

                final Map<Long, MetadataFieldPojo> metadataFields = metadataFieldRepository
                    .createIfNotExist(mfPojos)
                    .stream()
                    .collect(Collectors.toMap(MetadataFieldPojo::getId, Function.identity()));

                final List<MetadataFieldValuePojo> mfvPojos = metadataFields.values().stream()
                    .map(f -> new MetadataFieldValuePojo()
                        .setMetadataFieldId(f.getId())
                        .setValue(mg.get(new MetadataFieldKey(f.getName(), f.getType())).getValue())
                        .setDataEntityId(dataEntityId))
                    .collect(Collectors.toList());

                final List<MetadataFieldValue> fields = metadataFieldValueRepository
                    .bulkCreate(mfvPojos)
                    .stream()
                    .map(mfv -> {
                        final MetadataFieldPojo metadataFieldPojo =
                            metadataFields.get(mfv.getMetadataFieldId());
                        return new MetadataFieldValue()
                            .field(new MetadataField()
                                .id(metadataFieldPojo.getId())
                                .name(metadataFieldPojo.getName())
                                .origin(MetadataFieldOrigin
                                    .fromValue(metadataFieldPojo.getOrigin()))
                                .type(MetadataFieldType.valueOf(metadataFieldPojo.getType()))
                            )
                            .value(mfv.getValue());
                    })
                    .collect(Collectors.toList());

                entityRepository.calculateMetadataVectors(List.of(dataEntityId));
                return new MetadataFieldValueList().items(fields);
            });
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
    // TODO: refactor
    // TODO: fix non-transactional update of search entrypoint and Tag CRUD
    public Flux<Tag> upsertTags(final long dataEntityId, final DataEntityTagsFormData formData) {
        final Set<String> names = new HashSet<>(formData.getTagNameList());

        return Mono.just(dataEntityId)
            .map(tagRepository::listByDataEntityId)
            .flatMapIterable(labels -> {
                final List<TagPojo> existingTags = tagRepository.listByNames(names);
                final List<String> existingTagsNames = existingTags.stream()
                    .map(TagPojo::getName)
                    .collect(Collectors.toList());
                final Set<String> labelNames = labels.stream().map(TagPojo::getName).collect(Collectors.toSet());

                final List<Long> idsToDelete = labels
                    .stream()
                    .filter(l -> !names.contains(l.getName()))
                    .map(TagPojo::getId)
                    .collect(Collectors.toList());

                tagRepository.deleteRelations(dataEntityId, idsToDelete);

                final List<TagPojo> tagToCreate = formData.getTagNameList()
                    .stream()
                    .filter(n -> !labelNames.contains(n) && !existingTagsNames.contains(n))
                    .map(n -> new TagPojo().setName(n).setImportant(false))
                    .collect(Collectors.toList());

                final List<Long> createdIds = tagRepository
                    .bulkCreate(tagToCreate)
                    .stream()
                    .map(TagPojo::getId)
                    .collect(Collectors.toList());

                final Set<Long> toRelate = Stream.concat(
                    createdIds.stream(),
                    existingTags.stream().map(TagPojo::getId).filter(not(idsToDelete::contains))
                ).collect(Collectors.toSet());

                tagRepository.createRelations(dataEntityId, toRelate);

                entityRepository.calculateTagVectors(List.of(dataEntityId));

                return Stream
                    .concat(tagToCreate.stream(), existingTags.stream())
                    .map(tagMapper::mapPojo)
                    .collect(Collectors.toList());
            });
    }

    @Override
    // TODO: refactor
    // TODO: fix non-transactional update of search entrypoint
    public Mono<MetadataFieldValue> upsertMetadataFieldValue(final long dataEntityId,
                                                             final long metadataFieldId,
                                                             final MetadataFieldValueUpdateFormData formData) {
        return Mono.just(new MetadataFieldValuePojo()
            .setDataEntityId(dataEntityId)
            .setMetadataFieldId(metadataFieldId)
            .setActive(true)
            .setValue(formData.getValue()))
            .flatMap(pojo -> {
                final Optional<MetadataFieldPojo> metadataFieldPojo = metadataFieldRepository.get(metadataFieldId);
                if (metadataFieldPojo.isEmpty()) {
                    return Mono.error(new NotFoundException());
                }

                final MetadataFieldValuePojo enrichedPojo = metadataFieldValueRepository.update(pojo);

                entityRepository.calculateMetadataVectors(List.of(dataEntityId));

                return Mono.just(new MetadataFieldValue()
                    .field(metadataFieldMapper.mapPojo(metadataFieldPojo.get()))
                    .value(enrichedPojo.getValue()));
            });
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
