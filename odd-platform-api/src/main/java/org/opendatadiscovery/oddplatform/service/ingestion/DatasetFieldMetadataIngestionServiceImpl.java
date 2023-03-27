package org.opendatadiscovery.oddplatform.service.ingestion;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.MapUtils;
import org.apache.commons.collections4.SetUtils;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataBinding;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataInfo;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataKey;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataTypeEnum;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldMetadataValuePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldMetadataValueRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldRepository;
import org.opendatadiscovery.oddplatform.service.MetadataFieldService;
import org.opendatadiscovery.oddplatform.service.metadata.MetadataParser;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static reactor.function.TupleUtils.function;

@Component
@RequiredArgsConstructor
public class DatasetFieldMetadataIngestionServiceImpl implements DatasetFieldMetadataIngestionService {
    private final MetadataParser metadataParser;
    private final ReactiveDatasetFieldMetadataValueRepository datasetFieldMetadataValueRepository;
    private final ReactiveDatasetFieldRepository datasetFieldRepository;
    private final MetadataFieldService metadataFieldService;

    @Override
    @ReactiveTransactional
    public Mono<Void> ingestMetadata(final IngestionRequest request) {
        final List<DatasetFieldPojo> pojos = getDatasetFieldPojos(request);
        if (CollectionUtils.isEmpty(pojos)) {
            return Mono.empty();
        }
        final Mono<Map<String, DatasetFieldPojo>> datasetFieldOddrnToPojo =
            datasetFieldRepository.getExistingFieldsByOddrnAndType(pojos);

        return datasetFieldOddrnToPojo.flatMap(fields -> ingestMetadataForFields(request, fields));
    }

    private Mono<Void> ingestMetadataForFields(final IngestionRequest request,
                                               final Map<String, DatasetFieldPojo> fields) {
        final List<MetadataInfo> metadataInfos = retrieveMetadataInfoFromDatasetFields(request, fields);
        final List<MetadataKey> metadataKeys = metadataInfos.stream()
            .map(MetadataInfo::key)
            .distinct()
            .toList();
        final List<Long> datasetFieldIds = fields.values().stream()
            .map(DatasetFieldPojo::getId)
            .toList();
        final var existingMono = datasetFieldMetadataValueRepository.listByDatasetFieldIds(datasetFieldIds)
            .collect(Collectors.toMap(
                mv -> new MetadataBinding(mv.getDatasetFieldId(), mv.getMetadataFieldId()),
                identity()
            ));
        return metadataFieldService.ingestMetadataFields(metadataKeys)
            .zipWith(existingMono)
            .flatMap(function((allMetadataFields, existingMetadataValues) -> {
                final List<DatasetFieldMetadataValuePojo> valuesToCreate = new ArrayList<>();
                final List<DatasetFieldMetadataValuePojo> valuesToUpdate = new ArrayList<>();

                for (final MetadataInfo metadataInfo : metadataInfos) {
                    final Long metadataFieldId = allMetadataFields.get(metadataInfo.key()).getId();
                    final DatasetFieldMetadataValuePojo metadataFieldValuePojo =
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
                    datasetFieldMetadataValueRepository.delete(bindingsToDelete),
                    datasetFieldMetadataValueRepository.bulkCreate(valuesToCreate),
                    datasetFieldMetadataValueRepository.bulkUpdate(valuesToUpdate)
                ).then();
            }));
    }

    private List<DatasetFieldPojo> getDatasetFieldPojos(final IngestionRequest request) {
        return request.getAllEntities().stream()
            .filter(e -> e.getDataSet() != null && CollectionUtils.isNotEmpty(e.getDataSet().fieldList()))
            .flatMap(e -> e.getDataSet().fieldList().stream())
            .map(DataEntityIngestionDto.DatasetFieldIngestionDto::field)
            .toList();
    }

    private List<MetadataInfo> retrieveMetadataInfoFromDatasetFields(final IngestionRequest request,
                                                                     final Map<String, DatasetFieldPojo> pojosMap) {
        return request.getAllEntities().stream()
            .filter(e -> e.getDataSet() != null)
            .flatMap(e -> e.getDataSet().fieldList().stream())
            .filter(f -> MapUtils.isNotEmpty(f.metadata()))
            .flatMap(f -> f.metadata().entrySet().stream()
                .filter(es -> es.getValue() != null)
                .map(es -> {
                    final MetadataTypeEnum type = metadataParser.parse(es.getValue());
                    final MetadataKey key = new MetadataKey(es.getKey(), type);
                    final DatasetFieldPojo pojo = pojosMap.get(f.field().getOddrn());
                    return new MetadataInfo(key, pojo.getId(), es.getValue());
                }))
            .filter(mi -> !MetadataTypeEnum.UNKNOWN.equals(mi.key().fieldType())).toList();
    }

    private DatasetFieldMetadataValuePojo createValuePojo(final MetadataInfo info, final Long metadataId) {
        return new DatasetFieldMetadataValuePojo(info.referenceId(), metadataId, info.value().toString());
    }
}
