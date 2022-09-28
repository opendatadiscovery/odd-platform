package org.opendatadiscovery.oddplatform.service.ingestion.processor;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.MapUtils;
import org.apache.commons.collections4.SetUtils;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataBinding;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataKey;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataOrigin;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataTypeEnum;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldValuePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveMetadataFieldRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveMetadataFieldValueRepository;
import org.opendatadiscovery.oddplatform.service.metadata.MetadataParser;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static reactor.function.TupleUtils.function;

@Service
@RequiredArgsConstructor
@Slf4j
public class MetadataIngestionRequestProcessor implements IngestionRequestProcessor {
    private final MetadataParser metadataParser;
    private final ReactiveMetadataFieldRepository metadataFieldRepository;
    private final ReactiveMetadataFieldValueRepository metadataFieldValueRepository;

    @Override
    public Mono<Void> process(final IngestionRequest request) {
        final List<MetadataInfo> metadataInfos = retrieveMetadataInfoFromDataStructure(request);

        final List<MetadataFieldPojo> metadataFieldPojos = metadataInfos.stream()
            .map(MetadataInfo::key)
            .distinct()
            .map(this::createPojoFromKey)
            .toList();

        final Map<MetadataKey, MetadataFieldPojo> entitiesMap = metadataFieldPojos
            .stream()
            .collect(Collectors.toMap(MetadataKey::new, identity()));

        return metadataFieldRepository.listByKey(entitiesMap.keySet())
            .collect(Collectors.toMap(MetadataKey::new, identity()))
            .flatMapMany(existing -> persistMetadataFields(entitiesMap, existing))
            .collect(Collectors.toMap(MetadataKey::new, identity()))
            .zipWith(
                metadataFieldValueRepository
                    .listByDataEntityIds(request.getAllIds())
                    .collect(Collectors.toMap(
                        mf -> new MetadataBinding(mf.getDataEntityId(), mf.getMetadataFieldId()),
                        identity()
                    ))
            )
            .flatMap(function((allMetadataFields, existingMetadataValues) -> {
                final List<MetadataFieldValuePojo> valuesToCreate = new ArrayList<>();
                final List<MetadataFieldValuePojo> valuesToUpdate = new ArrayList<>();

                for (final MetadataInfo metadataInfo : metadataInfos) {
                    final Long metadataFieldId = allMetadataFields.get(metadataInfo.key()).getId();
                    final MetadataFieldValuePojo metadataFieldValuePojo =
                        existingMetadataValues.get(new MetadataBinding(metadataInfo.entityId(), metadataFieldId));

                    if (metadataFieldValuePojo != null) {
                        metadataFieldValuePojo.setValue(metadataInfo.value().toString());
                        valuesToUpdate.add(metadataFieldValuePojo);
                    } else {
                        valuesToCreate.add(createValuePojo(metadataInfo, metadataFieldId));
                    }
                }

                final Set<MetadataBinding> existingMetadataBindings = metadataInfos.stream()
                    .map(mi -> new MetadataBinding(mi.entityId(), allMetadataFields.get(mi.key()).getId()))
                    .collect(Collectors.toSet());

                final Set<MetadataBinding> bindingsToDelete = SetUtils
                    .difference(existingMetadataValues.keySet(), existingMetadataBindings)
                    .toSet();

                return Mono.zipDelayError(
                    metadataFieldValueRepository.delete(bindingsToDelete),
                    metadataFieldValueRepository.bulkCreate(valuesToCreate),
                    metadataFieldValueRepository.bulkUpdate(valuesToUpdate)
                ).then();
            }));
    }

    @Override
    public boolean shouldProcess(final IngestionRequest request) {
        return true;
    }

    private Flux<MetadataFieldPojo> persistMetadataFields(final Map<MetadataKey, MetadataFieldPojo> entities,
                                                          final Map<MetadataKey, MetadataFieldPojo> existing) {
        final List<MetadataFieldPojo> newMetadataFields = entities.entrySet()
            .stream()
            .filter(e -> !existing.containsKey(e.getKey()))
            .map(Map.Entry::getValue)
            .toList();

        return metadataFieldRepository
            .bulkCreate(newMetadataFields)
            .mergeWith(Flux.fromIterable(existing.values()));
    }

    private List<MetadataInfo> retrieveMetadataInfoFromDataStructure(final IngestionRequest dataStructure) {
        return dataStructure.getAllEntities().stream()
            .filter(e -> MapUtils.isNotEmpty(e.getMetadata()))
            .flatMap(e -> e.getMetadata().entrySet().stream()
                .filter(es -> es.getValue() != null)
                .map(es -> {
                    final MetadataTypeEnum type = metadataParser.parse(es.getValue());
                    final MetadataKey key = new MetadataKey(es.getKey(), type);
                    return new MetadataInfo(key, e.getId(), es.getValue());
                }))
            .filter(mi -> !MetadataTypeEnum.UNKNOWN.equals(mi.key().fieldType())).toList();
    }

    private MetadataFieldPojo createPojoFromKey(final MetadataKey key) {
        return new MetadataFieldPojo()
            .setName(key.fieldName())
            .setType(key.fieldType().name())
            .setOrigin(MetadataOrigin.EXTERNAL.name());
    }

    private MetadataFieldValuePojo createValuePojo(final MetadataInfo info, final Long metadataId) {
        return new MetadataFieldValuePojo(info.entityId(), metadataId, info.value().toString(), true);
    }

    public record MetadataInfo(MetadataKey key, Long entityId, Object value) {
    }
}
