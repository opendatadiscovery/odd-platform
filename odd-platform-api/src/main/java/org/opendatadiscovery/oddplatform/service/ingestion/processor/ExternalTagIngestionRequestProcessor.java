package org.opendatadiscovery.oddplatform.service.ingestion.processor;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagToDataEntityPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTagRepository;
import org.opendatadiscovery.oddplatform.service.TagService;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static reactor.function.TupleUtils.function;

@Service
@RequiredArgsConstructor
public class ExternalTagIngestionRequestProcessor implements IngestionRequestProcessor {
    private final TagService tagService;
    private final ReactiveTagRepository reactiveTagRepository;

    @Override
    @ReactiveTransactional
    public Mono<Void> process(final IngestionRequest request) {
        final Set<String> tagNames = getTagNames(request);
        final Mono<List<TagToDataEntityPojo>> currentExternalRelations = reactiveTagRepository
            .listTagRelations(request.getAllIds())
            .filter(TagToDataEntityPojo::getExternal)
            .collectList();

        final Mono<List<TagToDataEntityPojo>> updatedExternalRelations = tagService.getOrCreateTagsByName(tagNames)
            .map(tags -> tags.stream().collect(Collectors.toMap(TagPojo::getName, identity())))
            .map(tagsMap -> getUpdatedRelations(tagsMap, request));

        return Mono.zip(currentExternalRelations, updatedExternalRelations)
            .flatMap(function((current, updated) -> {
                final List<TagToDataEntityPojo> pojosToDelete = current.stream()
                    .filter(r -> !updated.contains(r))
                    .toList();
                return reactiveTagRepository.deleteDataEntityRelations(pojosToDelete)
                    .then(Mono.just(updated));
            }))
            .flatMapMany(reactiveTagRepository::createDataEntityRelations)
            .then();
    }

    @Override
    public boolean shouldProcess(final IngestionRequest request) {
        return true;
    }

    private List<TagToDataEntityPojo> getUpdatedRelations(final Map<String, TagPojo> tagsMap,
                                                          final IngestionRequest dataStructure) {
        return dataStructure.getAllEntities().stream()
            .filter(e -> CollectionUtils.isNotEmpty(e.getTags()))
            .flatMap(entity -> entity.getTags().stream()
                .map(tagName -> new TagToDataEntityPojo()
                    .setTagId(tagsMap.get(tagName).getId())
                    .setDataEntityId(entity.getId())
                    .setExternal(true))
            ).toList();
    }

    private Set<String> getTagNames(final IngestionRequest dataStructure) {
        return dataStructure.getAllEntities().stream()
            .filter(e -> CollectionUtils.isNotEmpty(e.getTags()))
            .flatMap(e -> e.getTags().stream())
            .collect(Collectors.toSet());
    }
}
