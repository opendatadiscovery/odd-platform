package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.DatasetFieldLabelsFormData;
import com.provectus.oddplatform.api.contract.model.InternalDescription;
import com.provectus.oddplatform.api.contract.model.InternalDescriptionFormData;
import com.provectus.oddplatform.api.contract.model.Label;
import com.provectus.oddplatform.mapper.LabelMapper;
import com.provectus.oddplatform.model.tables.pojos.LabelPojo;
import com.provectus.oddplatform.repository.DatasetFieldRepository;
import com.provectus.oddplatform.repository.LabelRepository;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.function.Predicate.not;

@Service
@RequiredArgsConstructor
public class DatasetFieldServiceImpl implements DatasetFieldService {
    private final DatasetFieldRepository datasetFieldRepository;
    private final LabelRepository labelRepository;
    private final LabelMapper labelMapper;

    @Override
    public Mono<InternalDescription> upsertDescription(final long datasetFieldId,
                                                       final InternalDescriptionFormData form) {
        return Mono
                .just(form.getInternalDescription())
                .map(d -> {
                    datasetFieldRepository.setDescription(datasetFieldId, d);
                    return new InternalDescription().internalDescription(d);
                });
    }

    @Override
    public Flux<Label> upsertLabels(final long datasetFieldId,
                                    final DatasetFieldLabelsFormData formData) {
        final Set<String> names = new HashSet<>(formData.getLabelNameList());

        return Mono.just(datasetFieldId)
                .map(labelRepository::listByDatasetFieldId)
                .flatMapIterable(labels -> {
                    final List<LabelPojo> existingLabels = labelRepository.listByNames(names);
                    final List<String> existingLabelsNames = existingLabels.stream()
                            .map(LabelPojo::getName)
                            .collect(Collectors.toList());
                    final Set<String> labelNames = labels.stream().map(LabelPojo::getName).collect(Collectors.toSet());

                    final List<Long> idsToDelete = labels
                            .stream()
                            .filter(l -> !names.contains(l.getName()))
                            .map(LabelPojo::getId)
                            .collect(Collectors.toList());

                    labelRepository.deleteRelations(datasetFieldId, idsToDelete);

                    final List<LabelPojo> labelToCreate = names
                            .stream()
                            .filter(n -> !labelNames.contains(n) && !existingLabelsNames.contains(n))
                            .map(n -> new LabelPojo().setName(n))
                            .collect(Collectors.toList());

                    final List<Long> createdIds = labelRepository
                            .bulkCreate(labelToCreate)
                            .stream()
                            .map(LabelPojo::getId)
                            .collect(Collectors.toList());

                    final Set<Long> toRelate = Stream.concat(
                            createdIds.stream(),
                            existingLabels.stream().map(LabelPojo::getId).filter(not(idsToDelete::contains))
                    ).collect(Collectors.toSet());

                    labelRepository.createRelations(datasetFieldId, toRelate);

                    return Stream
                            .concat(labelToCreate.stream(), existingLabels.stream())
                            .map(labelMapper::mapPojo)
                            .collect(Collectors.toList());
                });
    }
}
