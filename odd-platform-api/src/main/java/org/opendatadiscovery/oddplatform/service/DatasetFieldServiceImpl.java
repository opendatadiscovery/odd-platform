package org.opendatadiscovery.oddplatform.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.SetUtils;
import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.mapper.DatasetFieldApiMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLabelRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static java.util.function.Predicate.not;

@Service
@RequiredArgsConstructor
public class DatasetFieldServiceImpl implements DatasetFieldService {
    private final DatasetFieldApiMapper datasetFieldApiMapper;
    private final ReactiveDatasetFieldRepository reactiveDatasetFieldRepository;
    private final ReactiveLabelRepository reactiveLabelRepository;
    private final ReactiveSearchEntrypointRepository reactiveSearchEntrypointRepository;

    @Override
    @ReactiveTransactional
    public Mono<DataSetField> updateDatasetField(final long datasetFieldId,
                                                 final DatasetFieldUpdateFormData datasetFieldUpdateFormData) {
        return reactiveDatasetFieldRepository.getDto(datasetFieldId)
            .switchIfEmpty(Mono.error(
                new IllegalArgumentException(String.format("DatasetField not found by id = %s", datasetFieldId))))
            .flatMap(dto -> updateDescription(datasetFieldId, datasetFieldUpdateFormData, dto))
            .zipWith(updateDatasetFieldLabels(datasetFieldId, datasetFieldUpdateFormData))
            .map(tuple -> {
                final DatasetFieldDto dto = tuple.getT1();
                final Set<LabelPojo> labels = tuple.getT2();
                dto.setLabelPojos(labels);
                return dto;
            })
            .flatMap(dto -> reactiveSearchEntrypointRepository.updateDatasetFieldSearchVectors(datasetFieldId)
                .ignoreElement().thenReturn(dto))
            .map(datasetFieldApiMapper::mapDto);
    }

    private Mono<Set<LabelPojo>> updateDatasetFieldLabels(final long datasetFieldId,
                                                          final DatasetFieldUpdateFormData datasetFieldUpdateFormData) {
        final Set<String> names = new HashSet<>(datasetFieldUpdateFormData.getLabelNames());

        return reactiveLabelRepository.listByDatasetFieldId(datasetFieldId)
            .collect(Collectors.toSet())
            .zipWith(reactiveLabelRepository.listByNames(names).collect(Collectors.toSet()))
            .flatMap(tuple -> updateDatasetFieldLabels(datasetFieldId, names, tuple.getT1(), tuple.getT2()));
    }

    @NotNull
    private Mono<Set<LabelPojo>> updateDatasetFieldLabels(final long datasetFieldId, final Set<String> names,
                                                          final Set<LabelPojo> currentLabels,
                                                          final Set<LabelPojo> existingLabels) {
        final Set<String> currentLabelsNames =
            currentLabels.stream().map(LabelPojo::getName).collect(Collectors.toSet());

        if (SetUtils.isEqualSet(currentLabelsNames, names)) {
            return Mono.just(currentLabels);
        }

        final List<Long> idsToDelete = currentLabels.stream()
            .filter(l -> !names.contains(l.getName()))
            .map(LabelPojo::getId)
            .collect(Collectors.toList());

        final List<String> existingLabelsNames = existingLabels.stream()
            .map(LabelPojo::getName)
            .collect(Collectors.toList());

        final List<LabelPojo> labelsToCreate = names.stream()
            .filter(n -> !existingLabelsNames.contains(n))
            .map(n -> new LabelPojo().setName(n))
            .collect(Collectors.toList());

        final List<Long> existingLabelIds =
            existingLabels.stream().map(LabelPojo::getId).filter(not(idsToDelete::contains)).collect(
                Collectors.toList());

        final Set<LabelPojo> pojos =
            Stream.concat(labelsToCreate.stream(), existingLabels.stream()).collect(Collectors.toSet());

        return reactiveLabelRepository.deleteRelations(datasetFieldId, idsToDelete)
            .thenMany(reactiveLabelRepository.bulkCreate(labelsToCreate))
            .map(LabelPojo::getId)
            .collectList()
            .flatMap(labelPojosIds -> {
                final Set<Long> toRelate =
                    Stream.concat(labelPojosIds.stream(), existingLabelIds.stream())
                        .collect(Collectors.toSet());
                return reactiveLabelRepository.createRelations(datasetFieldId, toRelate)
                    .ignoreElements()
                    .thenReturn(pojos);
            });
    }

    @NotNull
    private Mono<DatasetFieldDto> updateDescription(final long datasetFieldId,
                                                    final DatasetFieldUpdateFormData datasetFieldUpdateFormData,
                                                    final DatasetFieldDto dto) {
        final DatasetFieldPojo currentPojo = dto.getDatasetFieldPojo();
        final String newDescription = datasetFieldUpdateFormData.getDescription();
        if (!StringUtils.equals(currentPojo.getInternalDescription(), newDescription)) {
            currentPojo.setInternalDescription(newDescription);
            return reactiveDatasetFieldRepository.updateDescription(datasetFieldId, newDescription)
                .thenReturn(dto);
        }
        return Mono.just(dto);
    }
}
