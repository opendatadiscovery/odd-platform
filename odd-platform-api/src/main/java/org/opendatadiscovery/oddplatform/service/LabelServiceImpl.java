package org.opendatadiscovery.oddplatform.service;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.api.contract.model.Label;
import org.opendatadiscovery.oddplatform.api.contract.model.LabelFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LabelsResponse;
import org.opendatadiscovery.oddplatform.mapper.LabelMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;
import org.opendatadiscovery.oddplatform.repository.LabelRepository;
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
    implements CRUDService<Label, LabelsResponse, LabelFormData, LabelFormData> {

    public LabelServiceImpl(final LabelMapper entityMapper, final LabelRepository entityRepository) {
        super(entityMapper, entityRepository);
    }

    @Override
    // TODO: fix non-transactional Label CRUD
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
