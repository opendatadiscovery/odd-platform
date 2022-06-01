package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.EnumValueFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.EnumValueList;
import org.opendatadiscovery.oddplatform.mapper.EnumValueMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.EnumValuePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveEnumValueRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class EnumValueServiceImpl implements EnumValueService {
    private final ReactiveEnumValueRepository reactiveEnumValueRepository;
    private final EnumValueMapper mapper;

    @Override
    public Mono<EnumValueList> createEnumValues(final Long datasetFieldId, final List<EnumValueFormData> formData) {
        final List<EnumValuePojo> pojos = formData.stream()
            .map(fd -> mapper.mapToPojo(fd, datasetFieldId))
            .collect(Collectors.toList());

        final List<String> enumNames = pojos.stream()
            .map(EnumValuePojo::getName)
            .collect(Collectors.toList());

        if (hasDuplicates(enumNames)) {
            return Mono.error(new RuntimeException("There are duplicates in enum values"));
        }

        final List<Long> idsToKeep = pojos.stream()
            .map(EnumValuePojo::getId)
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        final Map<Boolean, List<EnumValuePojo>> partitions = pojos.stream()
            .collect(Collectors.partitioningBy(p -> p.getId() != null));

        return reactiveEnumValueRepository.softDeleteOutdatedEnumValues(datasetFieldId, idsToKeep)
            .then(
                Flux.concat(reactiveEnumValueRepository.bulkUpdate(partitions.get(true)),
                        reactiveEnumValueRepository.bulkCreate(partitions.get(false)))
                .map(mapper::mapToEnum)
                .collectList()
                .map(list -> new EnumValueList().items(list)));
    }

    @Override
    public Mono<EnumValueList> getEnumValues(final Long datasetFieldId) {
        return reactiveEnumValueRepository.getEnumValuesByFieldId(datasetFieldId)
            .map(mapper::mapToEnum)
            .collectList()
            .map(enumValues -> new EnumValueList().items(enumValues));
    }

    private boolean hasDuplicates(final List<String> sourceList) {
        if (CollectionUtils.isEmpty(sourceList)) {
            return false;
        }
        return sourceList.stream().distinct().count() != sourceList.size();
    }
}
