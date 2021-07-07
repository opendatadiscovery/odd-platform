package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.*;
import com.provectus.oddplatform.auth.AuthIdentityProvider;
import com.provectus.oddplatform.dto.DataEntityDimensionsDto;
import com.provectus.oddplatform.dto.MetadataFieldKey;
import com.provectus.oddplatform.dto.StreamKind;
import com.provectus.oddplatform.exception.NotFoundException;
import com.provectus.oddplatform.mapper.DataEntityMapper;
import com.provectus.oddplatform.mapper.MetadataFieldMapper;
import com.provectus.oddplatform.mapper.TagMapper;
import com.provectus.oddplatform.model.tables.pojos.MetadataFieldPojo;
import com.provectus.oddplatform.model.tables.pojos.MetadataFieldValuePojo;
import com.provectus.oddplatform.model.tables.pojos.TagPojo;
import com.provectus.oddplatform.repository.DataEntityRepository;
import com.provectus.oddplatform.repository.DataEntityTypeRepository;
import com.provectus.oddplatform.repository.MetadataFieldRepository;
import com.provectus.oddplatform.repository.MetadataFieldValueRepository;
import com.provectus.oddplatform.repository.TagRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.function.Predicate.not;

@Service
@Slf4j
public class DataEntityServiceImpl
    extends AbstractReadOnlyCRUDService<DataEntity, DataEntityList, DataEntityDimensionsDto, DataEntityMapper, DataEntityRepository>
    implements DataEntityService {

    private final AuthIdentityProvider authIdentityProvider;

    private final MetadataFieldValueRepository metadataFieldValueRepository;
    private final MetadataFieldRepository metadataFieldRepository;
    private final DataEntityTypeRepository dataEntityTypeRepository;
    private final TagRepository tagRepository;

    private final MetadataFieldMapper metadataFieldMapper;
    private final TagMapper tagMapper;

    public DataEntityServiceImpl(final DataEntityMapper entityMapper,
                                 final DataEntityRepository entityRepository,
                                 final AuthIdentityProvider authIdentityProvider,
                                 final MetadataFieldValueRepository metadataFieldValueRepository,
                                 final MetadataFieldRepository metadataFieldRepository,
                                 final DataEntityTypeRepository dataEntityTypeRepository,
                                 final TagRepository tagRepository,
                                 final MetadataFieldMapper metadataFieldMapper,
                                 final TagMapper tagMapper) {
        super(entityMapper, entityRepository);

        this.authIdentityProvider = authIdentityProvider;
        this.metadataFieldValueRepository = metadataFieldValueRepository;
        this.metadataFieldRepository = metadataFieldRepository;
        this.dataEntityTypeRepository = dataEntityTypeRepository;
        this.tagRepository = tagRepository;
        this.metadataFieldMapper = metadataFieldMapper;
        this.tagMapper = tagMapper;
    }

    @Override
    public Mono<DataEntityTypeDictionary> getDataEntityTypes() {
        return Mono
            .fromCallable(dataEntityTypeRepository::getTypes)
            .map(entityMapper::mapTypeDict);
    }

    @Override
    public Mono<DataEntityDetails> getDetails(final long dataEntityId) {
        return Mono.fromCallable(() -> entityRepository.getDetails(dataEntityId))
            .flatMap(optional -> optional.isEmpty()
                ? Mono.error(new NotFoundException())
                : Mono.just(optional.get()))
            .map(entityMapper::mapDtoDetails);
    }

    @Override
    public Mono<DataEntityList> list(final Integer page,
                                     final Integer size,
                                     final long entityType,
                                     final Long entitySubType) {
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
                                              final StreamKind streamKind) {
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
                            final MetadataFieldPojo metadataFieldPojo = metadataFields.get(mfv.getMetadataFieldId());
                            return new MetadataFieldValue()
                                .field(new MetadataField()
                                    .id(metadataFieldPojo.getId())
                                    .name(metadataFieldPojo.getName())
                                    .origin(MetadataFieldOrigin.fromValue(metadataFieldPojo.getOrigin()))
                                    .type(MetadataFieldType.valueOf(metadataFieldPojo.getType()))
                                )
                                .value(mfv.getValue());
                        }
                    )
                    .collect(Collectors.toList());

                entityRepository.recalculateSearchEntrypoints(dataEntityId);
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
            entityRepository.recalculateSearchEntrypoints(dataEntityId);
            return new InternalDescription().internalDescription(d);
        });
    }

    @Override
    public Mono<InternalName> upsertBusinessName(final long dataEntityId,
                                                 final InternalNameFormData formData) {
        return Mono.just(formData.getInternalName())
            .map(name -> {
                entityRepository.setInternalName(dataEntityId, name);
                entityRepository.recalculateSearchEntrypoints(dataEntityId);
                return new InternalName().internalName(name);
            });
    }

    @Override
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

                entityRepository.recalculateSearchEntrypoints(dataEntityId);

                return Stream
                    .concat(tagToCreate.stream(), existingTags.stream())
                    .map(tagMapper::mapPojo)
                    .collect(Collectors.toList());
            });
    }

    @Override
    // TODO: refactor
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

                entityRepository.recalculateSearchEntrypoints(dataEntityId);

                return Mono.just(new MetadataFieldValue()
                    .field(metadataFieldMapper.mapPojo(metadataFieldPojo.get()))
                    .value(enrichedPojo.getValue()));
            });
    }

    @Override
    public Mono<DataEntityLineage> getLineage(final long dataEntityId, final int lineageDepth) {
        return Mono
            .fromCallable(() -> entityRepository.getLineage(dataEntityId, lineageDepth))
            .flatMap(optional -> optional.isEmpty()
                ? Mono.error(new NotFoundException())
                : Mono.just(optional.get()))
            .map(entityMapper::mapLineageDto);
    }
}
