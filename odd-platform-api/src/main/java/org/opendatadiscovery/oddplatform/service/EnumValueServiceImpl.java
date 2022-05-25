package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.BooleanUtils;
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
        final var source =  Flux.fromStream(formData.stream())
            .map(fd -> mapper.mapToPojo(fd, datasetFieldId)).cache();

        final var hasDuplicates = source
            .map(EnumValuePojo::getName)
            .collectList()
            .map(this::hasDuplicates)
            .filter(BooleanUtils::isFalse)
            .switchIfEmpty(Mono.error(new RuntimeException("There are duplicates in enum values")));

        final var deletedEnumValues = source
            .mapNotNull(EnumValuePojo::getId)
            .filter(Objects::nonNull)
            .collectList()
            .map(list -> reactiveEnumValueRepository.softDeleteOutdatedEnumValues(datasetFieldId, list));

        final var updatedEnumValues = source
            .filter(pojo -> pojo.getId() != null)
            .collectList()
            .map(reactiveEnumValueRepository::bulkUpdate);

        final var createdEnumValues = source
            .filter(pojo -> pojo.getId() == null)
            .collectList()
            .map(reactiveEnumValueRepository::bulkCreate);

        return hasDuplicates
            .then(
                Flux.concat(deletedEnumValues, updatedEnumValues, createdEnumValues)
                .flatMap(t -> t.filter(f -> !f.getIsDeleted()).map(mapper::mapToEnum))
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

    private <T> boolean hasDuplicates(final List<T> sourceList) {
        if (CollectionUtils.isEmpty(sourceList)) {
            return false;
        }
        return sourceList.stream().distinct().count() != sourceList.size();
    }
}
