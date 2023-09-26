package org.opendatadiscovery.oddplatform.service.ingestion.processor;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.TagOrigin;
import org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagToDataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagToDatasetFieldPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTagRepository;
import org.opendatadiscovery.oddplatform.service.TagService;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static reactor.function.TupleUtils.function;

@Service
@RequiredArgsConstructor
public class ExternalTagIngestionRequestProcessor implements IngestionRequestProcessor {
    private final TagService tagService;
    private final ReactiveTagRepository reactiveTagRepository;
    private final ReactiveDatasetFieldRepository datasetFieldRepository;

    @Override
    @ReactiveTransactional
    public Mono<Void> process(final IngestionRequest request) {
        final Flux<TagToDataEntityPojo> datasetEntitiesTags = updateDatasetEntityTags(request);
        final Flux<TagToDatasetFieldPojo> datasetFieldsTags = updateDatasetFieldsTags(request);

        return Flux.concat(datasetEntitiesTags, datasetFieldsTags).then();
    }

    @Override
    public boolean shouldProcess(final IngestionRequest request) {
        return true;
    }

    @Override
    public IngestionProcessingPhase getPhase() {
        return IngestionProcessingPhase.FINALIZING;
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

    private Flux<TagToDataEntityPojo> updateDatasetEntityTags(final IngestionRequest request) {
        final Set<String> tagNames = getTagNames(request);

        final Mono<List<TagToDataEntityPojo>> updatedExternalRelations = tagService.getOrInjectTagByName(tagNames)
            .collectMap(TagPojo::getName, identity())
            .map(tagsMap -> getUpdatedRelations(tagsMap, request));

        final Mono<List<TagToDataEntityPojo>> currentExternalRelations = reactiveTagRepository
            .listTagRelations(request.getAllIds())
            .filter(TagToDataEntityPojo::getExternal)
            .collectList();

        return Mono.zip(currentExternalRelations, updatedExternalRelations)
            .flatMap(function((current, updated) -> {
                final List<TagToDataEntityPojo> pojosToDelete = current.stream()
                    .filter(r -> !updated.contains(r))
                    .toList();
                return reactiveTagRepository.deleteDataEntityRelations(pojosToDelete)
                    .then(Mono.just(updated));
            }))
            .flatMapMany(reactiveTagRepository::createDataEntityRelations);
    }

    private Flux<TagToDatasetFieldPojo> updateDatasetFieldsTags(final IngestionRequest request) {
        final List<EnrichedDataEntityIngestionDto> entities = request.getAllEntities().stream()
            .filter(e -> e.getEntityClasses().contains(DataEntityClassDto.DATA_SET))
            .toList();

        final Set<String> datasetFieldTagsNames = getDatasetFieldTagNames(entities);
        final Mono<Map<String, DatasetFieldPojo>> datasetFieldOddrnToPojo = getDatasetFieldsOddrn(entities);

        return datasetFieldOddrnToPojo.flatMap(datasetFieldMap -> {
            final List<Long> datasetFieldIds = datasetFieldMap.values().stream()
                .map(DatasetFieldPojo::getId)
                .toList();

            return tagService.getOrCreateTagsByName(datasetFieldTagsNames)
                .collectMap(TagPojo::getName, identity())
                .map(tagsMap -> getUpdatedFieldsRelations(tagsMap, datasetFieldMap, entities))
                .zipWith(
                    reactiveTagRepository.listTagsRelations(datasetFieldIds, TagOrigin.EXTERNAL).collectList());
        })
        .flatMap((function((updated, current) -> {
            final List<TagToDatasetFieldPojo> pojosToDelete = current.stream()
                .filter(r -> !updated.contains(r))
                .toList();

            return reactiveTagRepository.deleteDatasetFieldRelations(pojosToDelete).then(Mono.just(updated));
        })))
        .flatMapMany(reactiveTagRepository::createDatasetFieldRelations);
    }

    private Mono<Map<String, DatasetFieldPojo>> getDatasetFieldsOddrn(
        final List<EnrichedDataEntityIngestionDto> datasetEntities) {
        final List<String> oddrns = datasetEntities.stream()
            .map(DataEntityIngestionDto::getDataSet)
            .filter(ds -> CollectionUtils.isNotEmpty(ds.fieldList()))
            .flatMap(ds -> ds.fieldList().stream())
            .map(dto -> dto.field().getOddrn())
            .toList();

        if (CollectionUtils.isEmpty(oddrns)) {
            return Mono.empty();
        }

        return datasetFieldRepository.getLastVersionDatasetFieldsByOddrns(oddrns)
            .collect(Collectors.toMap(DatasetFieldPojo::getOddrn, identity()));
    }

    private List<TagToDatasetFieldPojo> getUpdatedFieldsRelations(final Map<String, TagPojo> tagsMap,
                                                                  final Map<String, DatasetFieldPojo> datasetFieldMap,
                                                                  final List<EnrichedDataEntityIngestionDto> entities) {
        return getDatasetFieldsWithTagsStream(entities)
            .flatMap(ds -> ds.tags()
                .stream()
                .map(tag -> new TagToDatasetFieldPojo()
                    .setTagId(tagsMap.get(tag).getId())
                    .setDatasetFieldId(datasetFieldMap.get(ds.field().getOddrn()).getId())
                    .setOrigin(TagOrigin.EXTERNAL.toString())
                )).toList();
    }

    private Set<String> getTagNames(final IngestionRequest dataStructure) {
        return dataStructure.getAllEntities().stream()
            .filter(e -> CollectionUtils.isNotEmpty(e.getTags()))
            .flatMap(e -> e.getTags().stream())
            .collect(Collectors.toSet());
    }

    private Set<String> getDatasetFieldTagNames(final List<EnrichedDataEntityIngestionDto> datasetEntities) {
        return datasetEntities.stream()
            .map(DataEntityIngestionDto::getDataSet)
            .filter(ds -> CollectionUtils.isNotEmpty(ds.fieldList()))
            .flatMap(ds -> ds.fieldList().stream())
            .filter(field -> CollectionUtils.isNotEmpty(field.tags()))
            .flatMap(field -> field.tags().stream())
            .collect(Collectors.toSet());
    }

    private Stream<DataEntityIngestionDto.DatasetFieldIngestionDto> getDatasetFieldsWithTagsStream(
        final List<EnrichedDataEntityIngestionDto> entities) {
        return entities.stream()
            .map(DataEntityIngestionDto::getDataSet)
            .filter(ds -> CollectionUtils.isNotEmpty(ds.fieldList()))
            .flatMap(ds -> ds.fieldList().stream())
            .filter(field -> CollectionUtils.isNotEmpty(field.tags()));
    }
}
