package org.opendatadiscovery.oddplatform.service.ingestion;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionDataStructure;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Tag;
import org.opendatadiscovery.oddplatform.mapper.DatasetFieldMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelToDatasetFieldPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLabelRepository;
import org.opendatadiscovery.oddplatform.service.ReactiveLabelService;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static reactor.function.TupleUtils.function;

@Service
@RequiredArgsConstructor
public class LabelIngestionServiceImpl implements LabelIngestionService {
    private final ReactiveLabelRepository labelRepository;
    private final ReactiveDatasetFieldRepository datasetFieldRepository;
    private final ReactiveLabelService labelService;
    private final DatasetFieldMapper datasetFieldMapper;

    @Override
    public Mono<IngestionDataStructure> ingestExternalLabels(final IngestionDataStructure dataStructure) {
        final List<EnrichedDataEntityIngestionDto> datasetEntities = dataStructure.getAllEntities().stream()
            .filter(e -> e.getEntityClasses().contains(DataEntityClassDto.DATA_SET))
            .toList();

        final List<DatasetFieldPojo> pojos = datasetEntities.stream()
            .map(DataEntityIngestionDto::getDataSet)
            .filter(ds -> CollectionUtils.isNotEmpty(ds.fieldList()))
            .flatMap(ds -> ds.fieldList().stream())
            .map(datasetFieldMapper::mapField)
            .toList();

        if (CollectionUtils.isEmpty(pojos)) {
            return Mono.just(dataStructure);
        }

        final Mono<Map<String, DatasetFieldPojo>> datasetFieldOddrnToPojo = datasetFieldRepository
            .getExistingFieldsByOddrnAndType(pojos);
        final Set<String> externalLabelNames = getLabelNames(datasetEntities);

        return datasetFieldOddrnToPojo
            .flatMap(datasetFieldMap -> {
                final List<Long> datasetFieldIds = datasetFieldMap.values().stream()
                    .map(DatasetFieldPojo::getId)
                    .toList();
                return Mono.zip(getExternalRelations(datasetFieldIds),
                    labelService.getOrCreateLabelsByName(externalLabelNames)
                        .collectMap(LabelPojo::getName, identity())
                        .map(labelsMap -> getUpdatedRelations(labelsMap, datasetFieldMap, datasetEntities)));
            })
            .flatMap((function((current, updated) -> {
                final List<LabelToDatasetFieldPojo> pojosToDelete = current.stream()
                    .filter(r -> !updated.contains(r))
                    .toList();
                return labelRepository.deleteRelations(pojosToDelete)
                    .then(Mono.just(updated));
            })))
            .flatMapMany(labelRepository::createRelations)
            .then(Mono.just(dataStructure));
    }

    private Mono<List<LabelToDatasetFieldPojo>> getExternalRelations(final Collection<Long> datasetFieldIds) {
        return labelRepository.listLabelRelations(datasetFieldIds)
            .filter(LabelToDatasetFieldPojo::getExternal)
            .collectList();
    }

    private List<LabelToDatasetFieldPojo> getUpdatedRelations(final Map<String, LabelPojo> labelsMap,
                                                              final Map<String, DatasetFieldPojo> datasetFieldMap,
                                                              final List<EnrichedDataEntityIngestionDto> entities) {
        return getDatasetFieldsWithLabelsStream(entities)
            .flatMap(ds -> ds.getTags()
                .stream()
                .map(label -> new LabelToDatasetFieldPojo()
                    .setLabelId(labelsMap.get(label.getName()).getId())
                    .setDatasetFieldId(datasetFieldMap.get(ds.getOddrn()).getId())
                    .setExternal(true)
                )).toList();
    }

    private Set<String> getLabelNames(final List<EnrichedDataEntityIngestionDto> datasetEntities) {
        return getDatasetFieldsWithLabelsStream(datasetEntities)
            .flatMap(field -> field.getTags().stream())
            .map(Tag::getName)
            .collect(Collectors.toSet());
    }

    private Stream<DataSetField> getDatasetFieldsWithLabelsStream(final List<EnrichedDataEntityIngestionDto> entities) {
        return entities.stream()
            .map(DataEntityIngestionDto::getDataSet)
            .filter(ds -> CollectionUtils.isNotEmpty(ds.fieldList()))
            .flatMap(ds -> ds.fieldList().stream())
            .filter(field -> CollectionUtils.isNotEmpty(field.getTags()));
    }
}
