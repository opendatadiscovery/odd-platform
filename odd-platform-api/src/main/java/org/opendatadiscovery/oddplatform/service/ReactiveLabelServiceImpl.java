package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.Label;
import org.opendatadiscovery.oddplatform.api.contract.model.LabelFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LabelsResponse;
import org.opendatadiscovery.oddplatform.dto.LabelDto;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.LabelMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelToDatasetFieldPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLabelRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.service.activity.ActivityLog;
import org.opendatadiscovery.oddplatform.service.activity.ActivityParameter;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.function.Predicate.not;
import static org.opendatadiscovery.oddplatform.utils.ActivityParameterNames.DatasetFieldInformationUpdated.DATASET_FIELD_ID;

@Service
@RequiredArgsConstructor
public class ReactiveLabelServiceImpl implements ReactiveLabelService {
    private final ReactiveSearchEntrypointRepository searchEntrypointRepository;
    private final ReactiveLabelRepository labelRepository;
    private final LabelMapper labelMapper;

    @Override
    public Mono<LabelsResponse> list(final int page, final int size, final String query) {
        return labelRepository.pageDto(page, size, query).map(labelMapper::mapToLabelResponse);
    }

    @Override
    @ReactiveTransactional
    @ActivityLog(event = ActivityEventTypeDto.DATASET_FIELD_LABELS_UPDATED)
    public Mono<List<LabelDto>> updateDatasetFieldLabels(@ActivityParameter(DATASET_FIELD_ID) final long datasetFieldId,
                                                         final List<LabelToDatasetFieldPojo> currentRelations,
                                                         final List<LabelToDatasetFieldPojo> updatedRelations) {
        final List<LabelToDatasetFieldPojo> pojosToDelete = currentRelations.stream()
            .filter(r -> !updatedRelations.contains(r))
            .toList();
        return labelRepository.deleteRelations(pojosToDelete)
            .thenMany(labelRepository.createRelations(updatedRelations))
            .then(labelRepository.listDatasetFieldDtos(datasetFieldId));
    }

    @Override
    public Flux<LabelPojo> getOrCreateLabelsByName(final Set<String> labelNames) {
        return labelRepository.listByNames(labelNames)
            .collectList()
            .flatMapMany(existingLabels -> {
                final Set<String> existingLabelNames = existingLabels.stream()
                    .map(LabelPojo::getName)
                    .collect(Collectors.toSet());
                final List<LabelPojo> labelsToCreate = labelNames.stream()
                    .filter(labelName -> !existingLabelNames.contains(labelName))
                    .distinct()
                    .map(labelMapper::mapToPojo)
                    .toList();
                return labelRepository.bulkCreate(labelsToCreate).concatWith(Flux.fromIterable(existingLabels));
            });
    }

    @Override
    public Flux<Label> bulkUpsert(final List<LabelFormData> labelForms) {
        return labelRepository
            .bulkCreate(labelForms.stream().map(LabelFormData::getName).map(labelMapper::mapToPojo).toList())
            .map(labelMapper::mapToLabel);
    }

    @Override
    @ReactiveTransactional
    public Mono<Label> update(final long id, final LabelFormData form) {
        return labelRepository.getDto(id)
            .switchIfEmpty(Mono.error(new NotFoundException("Label", id)))
            .filter(not(LabelDto::hasExternalRelations))
            .switchIfEmpty(
                Mono.error(new BadUserRequestException("Can't update label which has external relations")))
            .flatMap(dto -> labelRepository.update(labelMapper.applyToPojo(dto.pojo(), form)))
            .flatMap(label -> searchEntrypointRepository.updateChangedLabelVector(label.getId()).thenReturn(label))
            .map(labelMapper::mapToLabel);
    }

    @Override
    @ReactiveTransactional
    public Mono<Label> delete(final long id) {
        return labelRepository.getDto(id)
            .switchIfEmpty(Mono.error(new NotFoundException("Label", id)))
            .filter(not(LabelDto::hasExternalRelations))
            .switchIfEmpty(
                Mono.error(new BadUserRequestException("Can't delete label which has external relations")))
            .thenMany(labelRepository.deleteRelations(id))
            .then(labelRepository.delete(id))
            .map(labelMapper::mapToLabel);
    }
}
