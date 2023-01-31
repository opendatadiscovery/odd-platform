package org.opendatadiscovery.oddplatform.service.ingestion;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.LabelOrigin;
import org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelToDatasetFieldPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLabelRepository;
import org.opendatadiscovery.oddplatform.service.ReactiveLabelService;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DatasetFieldIngestionDto;
import static reactor.function.TupleUtils.function;

@Service
@RequiredArgsConstructor
public class LabelIngestionServiceImpl implements LabelIngestionService {
    private final ReactiveLabelRepository labelRepository;
    private final ReactiveDatasetFieldRepository datasetFieldRepository;
    private final ReactiveLabelService labelService;

    @Override
    @ReactiveTransactional
    public Mono<Void> ingestExternalLabels(final IngestionRequest dataStructure) {
        final List<EnrichedDataEntityIngestionDto> datasetEntities = dataStructure.getAllEntities().stream()
            .filter(e -> e.getEntityClasses().contains(DataEntityClassDto.DATA_SET))
            .toList();

        final List<DatasetFieldPojo> pojos = datasetEntities.stream()
            .map(DataEntityIngestionDto::getDataSet)
            .filter(ds -> CollectionUtils.isNotEmpty(ds.fieldList()))
            .flatMap(ds -> ds.fieldList().stream())
            .map(DatasetFieldIngestionDto::field)
            .toList();

        if (CollectionUtils.isEmpty(pojos)) {
            return Mono.empty();
        }

        final Mono<Map<String, DatasetFieldPojo>> datasetFieldOddrnToPojo =
            datasetFieldRepository.getExistingFieldsByOddrnAndType(pojos);

        final Set<String> externalLabelNames = getLabelNames(datasetEntities);

        return datasetFieldOddrnToPojo
            .flatMap(datasetFieldMap -> {
                final List<Long> datasetFieldIds = datasetFieldMap.values().stream()
                    .map(DatasetFieldPojo::getId)
                    .toList();

                return labelService.getOrCreateLabelsByName(externalLabelNames)
                    .collectMap(LabelPojo::getName, identity())
                    .map(labelsMap -> getUpdatedRelations(labelsMap, datasetFieldMap, datasetEntities))
                    .zipWith(labelRepository.listLabelRelations(datasetFieldIds, LabelOrigin.EXTERNAL).collectList());
            })
            .flatMap((function((updated, current) -> {
                final List<LabelToDatasetFieldPojo> pojosToDelete = current.stream()
                    .filter(r -> !updated.contains(r))
                    .toList();

                return labelRepository.deleteRelations(pojosToDelete).then(Mono.just(updated));
            })))
            .flatMapMany(labelRepository::createRelations)
            .then();
    }

    private List<LabelToDatasetFieldPojo> getUpdatedRelations(final Map<String, LabelPojo> labelsMap,
                                                              final Map<String, DatasetFieldPojo> datasetFieldMap,
                                                              final List<EnrichedDataEntityIngestionDto> entities) {
        return getDatasetFieldsWithLabelsStream(entities)
            .flatMap(ds -> ds.labels()
                .stream()
                .map(label -> new LabelToDatasetFieldPojo()
                    .setLabelId(labelsMap.get(label).getId())
                    .setDatasetFieldId(datasetFieldMap.get(ds.field().getOddrn()).getId())
                    .setOrigin(LabelOrigin.EXTERNAL.toString())
                )).toList();
    }

    private Set<String> getLabelNames(final List<EnrichedDataEntityIngestionDto> datasetEntities) {
        return getDatasetFieldsWithLabelsStream(datasetEntities)
            .flatMap(field -> field.labels().stream())
            .collect(Collectors.toSet());
    }

    private Stream<DatasetFieldIngestionDto> getDatasetFieldsWithLabelsStream(
        final List<EnrichedDataEntityIngestionDto> entities
    ) {
        return entities.stream()
            .map(DataEntityIngestionDto::getDataSet)
            .filter(ds -> CollectionUtils.isNotEmpty(ds.fieldList()))
            .flatMap(ds -> ds.fieldList().stream())
            .filter(field -> CollectionUtils.isNotEmpty(field.labels()));
    }
}
