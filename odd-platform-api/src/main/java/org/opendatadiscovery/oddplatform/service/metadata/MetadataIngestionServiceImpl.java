package org.opendatadiscovery.oddplatform.service.metadata;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.MapUtils;
import org.opendatadiscovery.oddplatform.annotation.BlockingTransactional;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionDataStructure;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataBinding;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataKey;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataOrigin;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataTypeEnum;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldValuePojo;
import org.opendatadiscovery.oddplatform.repository.MetadataFieldRepository;
import org.opendatadiscovery.oddplatform.repository.MetadataFieldValueRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;

@Service
@Slf4j
@RequiredArgsConstructor
public class MetadataIngestionServiceImpl implements MetadataIngestionService {

    private final MetadataParser metadataParser;
    private final MetadataFieldRepository metadataFieldRepository;
    private final MetadataFieldValueRepository metadataFieldValueRepository;

    @Override
    @BlockingTransactional
    public Mono<IngestionDataStructure> ingestMetadata(final IngestionDataStructure dataStructure) {
        final List<MetadataInfo> metadataInfos = retrieveMetadataInfoFromDataStructure(dataStructure);

        final List<MetadataFieldPojo> metadataFieldPojos = metadataInfos.stream()
            .map(MetadataInfo::key)
            .distinct()
            .map(this::createPojoFromKey)
            .toList();

        final Map<MetadataKey, MetadataFieldPojo> allMetadata =
            metadataFieldRepository.createIfNotExist(metadataFieldPojos)
                .stream()
                .collect(Collectors.toMap(MetadataKey::new, identity()));

        final Map<MetadataBinding, MetadataFieldValuePojo> existingMetadataValues = metadataFieldValueRepository
            .listByDataEntityIds(dataStructure.getAllIds()).stream()
            .collect(Collectors.toMap(
                mf -> new MetadataBinding(mf.getDataEntityId(), mf.getMetadataFieldId()), identity()
            ));

        final List<MetadataFieldValuePojo> valuesToCreate = new ArrayList<>();
        final List<MetadataFieldValuePojo> valuesToUpdate = new ArrayList<>();

        metadataInfos.forEach(mi -> {
            final Long metadataId = allMetadata.get(mi.key()).getId();
            final MetadataFieldValuePojo metadataFieldValuePojo = existingMetadataValues
                .get(new MetadataBinding(mi.entityId(), metadataId));
            if (metadataFieldValuePojo != null) {
                metadataFieldValuePojo.setValue(mi.value().toString());
                valuesToUpdate.add(metadataFieldValuePojo);
            } else {
                valuesToCreate.add(createValuePojo(mi, metadataId));
            }
        });

        metadataFieldValueRepository.bulkCreate(valuesToCreate);
        metadataFieldValueRepository.bulkUpdate(valuesToUpdate);

        return Mono.just(dataStructure);
    }

    private List<MetadataInfo> retrieveMetadataInfoFromDataStructure(final IngestionDataStructure dataStructure) {
        return dataStructure.getAllEntities().stream()
            .filter(e -> MapUtils.isNotEmpty(e.getMetadata()))
            .flatMap(e -> e.getMetadata().entrySet().stream()
                .filter(es -> es.getValue() != null)
                .map(es -> {
                    final MetadataTypeEnum type = metadataParser.parse(es.getValue());
                    final MetadataKey key = new MetadataKey(es.getKey(), type);
                    return new MetadataInfo(key, e.getId(), es.getValue());
                }))
            .filter(mi -> {
                if (mi.key().fieldType() == MetadataTypeEnum.UNKNOWN) {
                    log.warn("Unknown metadata field for entity {}: {}, {}",
                        mi.entityId(), mi.key().fieldName(), mi.value());
                    return false;
                }
                return true;
            }).toList();
    }

    private MetadataFieldPojo createPojoFromKey(final MetadataKey key) {
        return new MetadataFieldPojo()
            .setName(key.fieldName())
            .setType(key.fieldType().name())
            .setOrigin(MetadataOrigin.EXTERNAL.name());
    }

    private MetadataFieldValuePojo createValuePojo(final MetadataInfo info, final Long metadataId) {
        return new MetadataFieldValuePojo(info.entityId(), metadataId,
            info.value().toString(), true);
    }

    public record MetadataInfo(MetadataKey key,
                               Long entityId,
                               Object value) {
    }
}
