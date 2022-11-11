package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.EnumValueFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.EnumValueList;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.mapper.EnumValueMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.EnumValuePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveEnumValueRepository;
import org.opendatadiscovery.oddplatform.service.activity.ActivityLog;
import org.opendatadiscovery.oddplatform.service.activity.ActivityParameter;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.dto.DataEntityFilledField.DATASET_FIELD_ENUMS;
import static org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto.DATASET_FIELD_VALUES_UPDATED;
import static org.opendatadiscovery.oddplatform.utils.ActivityParameterNames.DatasetFieldValuesUpdated.DATASET_FIELD_ID;

@Service
@RequiredArgsConstructor
public class EnumValueServiceImpl implements EnumValueService {
    private final ReactiveEnumValueRepository reactiveEnumValueRepository;
    private final DataEntityFilledService dataEntityFilledService;
    private final EnumValueMapper mapper;

    @Override
    @ReactiveTransactional
    @ActivityLog(event = DATASET_FIELD_VALUES_UPDATED)
    public Mono<EnumValueList> createEnumValues(@ActivityParameter(DATASET_FIELD_ID) final Long datasetFieldId,
                                                final List<EnumValueFormData> formData) {
        final List<EnumValuePojo> pojos = formData.stream()
            .map(fd -> mapper.mapToPojo(fd, datasetFieldId))
            .toList();

        final List<String> enumNames = pojos.stream()
            .map(EnumValuePojo::getName)
            .collect(Collectors.toList());

        if (hasDuplicates(enumNames)) {
            return Mono.error(new BadUserRequestException("There are duplicates in enum values"));
        }

        final List<Long> idsToKeep = pojos.stream()
            .map(EnumValuePojo::getId)
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        final Map<Boolean, List<EnumValuePojo>> partitions = pojos.stream()
            .collect(Collectors.partitioningBy(p -> p.getId() != null));

        return reactiveEnumValueRepository.softDeleteOutdatedEnumValuesExcept(datasetFieldId, idsToKeep)
            .then(
                Flux.concat(reactiveEnumValueRepository.bulkUpdate(partitions.get(true)),
                        reactiveEnumValueRepository.bulkCreate(partitions.get(false)))
                    .map(mapper::mapToEnum)
                    .collectList()
                    .flatMap(list -> {
                        if (CollectionUtils.isEmpty(list)) {
                            return dataEntityFilledService
                                .markEntityUnfilledByDatasetFieldId(datasetFieldId, DATASET_FIELD_ENUMS)
                                .thenReturn(list);
                        } else {
                            return dataEntityFilledService
                                .markEntityFilledByDatasetFieldId(datasetFieldId, DATASET_FIELD_ENUMS)
                                .thenReturn(list);
                        }
                    })
                    .map(list -> new EnumValueList().items(list)));
    }

    @Override
    public Mono<EnumValueList> getEnumValues(final Long datasetFieldId) {
        return reactiveEnumValueRepository.getEnumValuesByDatasetFieldId(datasetFieldId)
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
