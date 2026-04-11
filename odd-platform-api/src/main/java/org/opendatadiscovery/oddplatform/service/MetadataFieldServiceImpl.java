package org.opendatadiscovery.oddplatform.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.ListUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldList;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataKey;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataOrigin;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.MetadataFieldMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveMetadataFieldRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static java.util.function.Predicate.not;

@Service
@RequiredArgsConstructor
public class MetadataFieldServiceImpl implements MetadataFieldService {
    private final ReactiveMetadataFieldRepository reactiveMetadataFieldRepository;
    private final MetadataFieldMapper mapper;

    @Override
    public Mono<MetadataFieldPojo> get(final long metadataFieldId) {
        return reactiveMetadataFieldRepository.get(metadataFieldId)
            .switchIfEmpty(Mono.error(
                new NotFoundException("Metadata field with id %d not found".formatted(metadataFieldId))));
    }

    @Override
    public Mono<MetadataFieldList> listInternalMetadata(final String query) {
        return reactiveMetadataFieldRepository.listInternalMetadata(query)
            .map(mapper::mapPojos);
    }

    @Override
    public Mono<List<MetadataFieldPojo>> getOrCreateMetadataFields(final List<MetadataFieldPojo> metadataList) {
        final Map<MetadataKey, MetadataFieldPojo> metadataMap = metadataList.stream()
            .collect(Collectors.toMap(MetadataKey::new, identity()));
        return reactiveMetadataFieldRepository.listByKey(metadataMap.keySet())
            .collectList()
            .map(existing -> existing.stream().collect(Collectors.toMap(MetadataKey::new, identity())))
            .flatMap(existing -> {
                final List<MetadataFieldPojo> metadataFieldsToCreate = metadataMap.keySet().stream()
                    .filter(not(existing::containsKey))
                    .map(metadataMap::get)
                    .toList();

                return reactiveMetadataFieldRepository.bulkCreate(metadataFieldsToCreate)
                    .collectList()
                    .map(createdMetadata -> ListUtils.union(createdMetadata, new ArrayList<>(existing.values())));
            });
    }

    @Override
    public Mono<Map<MetadataKey, MetadataFieldPojo>> ingestMetadataFields(final List<MetadataKey> keys) {
        final Map<MetadataKey, MetadataFieldPojo> entitiesMap = keys.stream()
            .distinct()
            .map(this::createExternalPojoFromKey)
            .collect(Collectors.toMap(MetadataKey::new, identity()));
        return reactiveMetadataFieldRepository.listByKey(keys)
            .collect(Collectors.toMap(MetadataKey::new, identity()))
            .flatMapMany(existing -> persistMetadataFields(entitiesMap, existing))
            .collect(Collectors.toMap(MetadataKey::new, identity()));
    }

    private Flux<MetadataFieldPojo> persistMetadataFields(final Map<MetadataKey, MetadataFieldPojo> entities,
                                                          final Map<MetadataKey, MetadataFieldPojo> existing) {
        final List<MetadataFieldPojo> newMetadataFields = entities.entrySet()
            .stream()
            .filter(e -> !existing.containsKey(e.getKey()))
            .map(Map.Entry::getValue)
            .toList();

        return reactiveMetadataFieldRepository
            .ingestData(newMetadataFields)
            .mergeWith(Flux.fromIterable(existing.values()));
    }

    private MetadataFieldPojo createExternalPojoFromKey(final MetadataKey key) {
        return new MetadataFieldPojo()
            .setName(key.fieldName())
            .setType(key.fieldType().name())
            .setOrigin(MetadataOrigin.EXTERNAL.name());
    }
}
