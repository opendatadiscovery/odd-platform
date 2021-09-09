package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.Label;
import com.provectus.oddplatform.api.contract.model.LabelFormData;
import com.provectus.oddplatform.api.contract.model.LabelsResponse;
import com.provectus.oddplatform.mapper.LabelMapper;
import com.provectus.oddplatform.model.tables.pojos.LabelPojo;
import com.provectus.oddplatform.repository.LabelRepository;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.stream.Collectors.groupingBy;

@Service
@Slf4j
public class LabelServiceImpl
    extends
    AbstractCRUDService<Label, LabelsResponse, LabelFormData,
        LabelFormData, LabelPojo, LabelMapper, LabelRepository>
    implements LabelService {

    public LabelServiceImpl(final LabelMapper entityMapper, final LabelRepository entityRepository) {
        super(entityMapper, entityRepository);
    }

    @Override
    public Flux<Label> bulkCreate(final List<LabelFormData> forms) {
        final List<String> names = forms.stream().map(LabelFormData::getName).collect(Collectors.toList());

        return Mono.just(names)
            .map(entityRepository::listByNames)
            .map(labels -> labels.stream().collect(groupingBy(LabelPojo::getIsDeleted)))
            .flatMapMany(labels -> {
                if (!labels.getOrDefault(false, Collections.emptyList()).isEmpty()) {
                    return Flux.error(new IllegalStateException());
                }

                final List<LabelPojo> labelsToUpdate = labels.getOrDefault(true, Collections.emptyList())
                    .stream()
                    .map(l -> l.setIsDeleted(false))
                    .collect(Collectors.toList());

                entityRepository.bulkUpdate(labelsToUpdate);

                final Set<String> updateNames = labelsToUpdate.stream()
                    .map(LabelPojo::getName)
                    .collect(Collectors.toSet());

                final List<LabelPojo> labelsToCreate = forms.stream()
                    .filter(f -> !updateNames.contains(f.getName()))
                    .map(entityMapper::mapForm)
                    .collect(Collectors.toList());

                final Stream<Label> result =
                    Stream.concat(entityRepository.bulkCreate(labelsToCreate).stream(), labelsToUpdate.stream())
                        .map(entityMapper::mapPojo);

                return Flux.fromStream(result);
            });
    }
}
