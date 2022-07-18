package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.ListUtils;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.Tag;
import org.opendatadiscovery.oddplatform.api.contract.model.TagFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TagsResponse;
import org.opendatadiscovery.oddplatform.dto.TagDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.TagMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagToDataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagToTermPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTagRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermSearchEntrypointRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static reactor.function.TupleUtils.function;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {

    private final ReactiveTagRepository reactiveTagRepository;
    private final TagMapper tagMapper;
    private final ReactiveSearchEntrypointRepository reactiveSearchEntrypointRepository;
    private final ReactiveTermSearchEntrypointRepository reactiveTermSearchEntrypointRepository;

    @Override
    public Flux<Tag> bulkCreate(final List<TagFormData> tags) {
        final List<TagPojo> pojos = tags.stream().map(tagMapper::mapToPojo).toList();
        return reactiveTagRepository.bulkCreate(pojos)
            .map(tagMapper::mapToTag);
    }

    @Override
    @ReactiveTransactional
    public Mono<Tag> update(final long tagId, final TagFormData formData) {
        return reactiveTagRepository.getDto(tagId)
            .switchIfEmpty(Mono.error(new NotFoundException("Can't find tag with id %s", tagId)))
            .filter(tagDto -> !tagDto.external())
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Can't update tag which has external relations")))
            .map(tag -> tagMapper.applyToPojo(formData, tag.tagPojo()))
            .flatMap(reactiveTagRepository::update)
            .flatMap(this::updateSearchVectors)
            .map(tagMapper::mapToTag);
    }

    @Override
    @ReactiveTransactional
    public Mono<Tag> delete(final long tagId) {
        return reactiveTagRepository.getDto(tagId)
            .switchIfEmpty(Mono.error(new NotFoundException("Can't find tag with id %s", tagId)))
            .filter(tagDto -> !tagDto.external())
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Can't delete tag which has external relations")))
            .thenMany(Flux.zip(reactiveTagRepository.deleteTermRelations(tagId),
                reactiveTagRepository.deleteDataEntityRelations(tagId)))
            .then(reactiveTagRepository.delete(tagId))
            .map(tagMapper::mapToTag)
            .flatMap(tag -> reactiveTermSearchEntrypointRepository.updateChangedTagVectors(tagId)
                .thenReturn(tag));
    }

    @Override
    public Mono<TagsResponse> listMostPopular(final String query, final int page, final int size) {
        return reactiveTagRepository.listMostPopular(query, page, size)
            .map(tagMapper::mapToTagsResponse);
    }

    @Override
    public Mono<List<TagPojo>> getOrCreateTagsByName(final Set<String> tagNames) {
        return reactiveTagRepository.listByNames(tagNames)
            .collectList()
            .flatMap(existingTags -> {
                final List<String> existingTagNames = existingTags.stream()
                    .map(TagPojo::getName)
                    .toList();

                final List<TagPojo> tagToCreate = tagNames
                    .stream()
                    .filter(n -> !existingTagNames.contains(n))
                    .map(n -> new TagPojo().setName(n).setImportant(false)).toList();

                return reactiveTagRepository.bulkCreate(tagToCreate).collectList()
                    .map(createdTags -> ListUtils.union(createdTags, existingTags));
            });
    }

    @Override
    @ReactiveTransactional
    public Mono<List<TagDto>> updateRelationsWithDataEntity(final long dataEntityId,
                                                            final Set<String> tagNames) {
        final Mono<List<TagToDataEntityPojo>> currentRelations = reactiveTagRepository
            .listTagRelations(List.of(dataEntityId))
            .filter(pojo -> !pojo.getExternal())
            .collectList();

        final Mono<List<TagToDataEntityPojo>> updatedRelations = getOrCreateTagsByName(tagNames)
            .map(tags -> tags.stream()
                .map(t -> new TagToDataEntityPojo()
                    .setTagId(t.getId())
                    .setDataEntityId(dataEntityId)
                    .setExternal(false))
                .toList());

        return Mono.zip(currentRelations, updatedRelations)
            .flatMap(function((current, updated) -> {
                final List<TagToDataEntityPojo> pojosToDelete = current.stream()
                    .filter(r -> !updated.contains(r))
                    .toList();
                return reactiveTagRepository.deleteDataEntityRelations(pojosToDelete)
                    .thenMany(reactiveTagRepository.createDataEntityRelations(updated))
                    .then(reactiveTagRepository.listDataEntityDtos(dataEntityId));
            }));
    }

    @Override
    public Flux<TagToDataEntityPojo> deleteRelationsForDataEntity(final long dataEntityId) {
        return reactiveTagRepository.deleteRelationsForDataEntity(dataEntityId);
    }

    @Override
    public Flux<TagToTermPojo> deleteRelationsWithTerm(final long termId,
                                                       final Set<String> tagsToKeep) {
        return reactiveTagRepository.listByTerm(termId)
            .collectList()
            .flatMapMany(currentTags -> {
                final List<Long> idsToDelete = currentTags.stream()
                    .filter(l -> !tagsToKeep.contains(l.getName()))
                    .map(TagPojo::getId).toList();
                return reactiveTagRepository.deleteTermRelations(termId, idsToDelete);
            });
    }

    @Override
    @ReactiveTransactional
    public Flux<TagToTermPojo> createRelationsWithTerm(final long termId,
                                                       final List<TagPojo> tags) {
        final List<Long> ids = tags.stream().map(TagPojo::getId).toList();
        return reactiveTagRepository.createTermRelations(termId, ids);
    }

    private Mono<TagPojo> updateSearchVectors(final TagPojo updatedPojo) {
        return Mono.zip(
            reactiveSearchEntrypointRepository.updateChangedTagVectors(updatedPojo.getId()),
            reactiveTermSearchEntrypointRepository.updateChangedTagVectors(updatedPojo.getId())
        ).thenReturn(updatedPojo);
    }
}
