package org.opendatadiscovery.oddplatform.service.ingestion.processor;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.MapUtils;
import org.apache.commons.collections4.SetUtils;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataBinding;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataInfo;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataKey;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataTypeEnum;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldValuePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveMetadataFieldValueRepository;
import org.opendatadiscovery.oddplatform.service.MetadataFieldService;
import org.opendatadiscovery.oddplatform.service.metadata.MetadataParser;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static reactor.function.TupleUtils.function;

@Service
@RequiredArgsConstructor
@Slf4j
public class MetadataIngestionRequestProcessor implements IngestionRequestProcessor {
    private final MetadataParser metadataParser;
    private final ReactiveMetadataFieldValueRepository metadataFieldValueRepository;
    private final MetadataFieldService metadataFieldService;

    @Override
    public Mono<Void> process(final IngestionRequest request) {
        final List<MetadataInfo> metadataInfos = retrieveMetadataInfoFromDataStructure(request);
        final List<MetadataKey> metadataKeys = metadataInfos.stream()
            .map(MetadataInfo::key)
            .toList();

        final var existingMono = metadataFieldValueRepository.listByDataEntityIds(request.getAllIds())
            .collect(Collectors.toMap(
                mf -> new MetadataBinding(mf.getDataEntityId(), mf.getMetadataFieldId()),
                identity()
            ));
        return metadataFieldService.ingestMetadataFields(metadataKeys)
            .zipWith(existingMono)
            .flatMap(function((allMetadataFields, existingMetadataValues) -> {
                final List<MetadataFieldValuePojo> valuesToCreate = new ArrayList<>();
                final List<MetadataFieldValuePojo> valuesToUpdate = new ArrayList<>();

                for (final MetadataInfo metadataInfo : metadataInfos) {
                    final Long metadataFieldId = allMetadataFields.get(metadataInfo.key()).getId();
                    final MetadataFieldValuePojo metadataFieldValuePojo =
                        existingMetadataValues.get(new MetadataBinding(metadataInfo.referenceId(), metadataFieldId));

                    if (metadataFieldValuePojo != null) {
                        metadataFieldValuePojo.setValue(metadataInfo.value().toString());
                        valuesToUpdate.add(metadataFieldValuePojo);
                    } else {
                        valuesToCreate.add(createValuePojo(metadataInfo, metadataFieldId));
                    }
                }

                final Set<MetadataBinding> existingMetadataBindings = metadataInfos.stream()
                    .map(mi -> new MetadataBinding(mi.referenceId(), allMetadataFields.get(mi.key()).getId()))
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

    private MetadataFieldValuePojo createValuePojo(final MetadataInfo info, final Long metadataId) {
        return new MetadataFieldValuePojo(info.referenceId(), metadataId, info.value().toString(), true);
    }
}
