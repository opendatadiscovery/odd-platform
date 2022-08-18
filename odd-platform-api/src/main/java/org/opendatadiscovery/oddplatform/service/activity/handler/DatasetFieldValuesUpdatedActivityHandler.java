package org.opendatadiscovery.oddplatform.service.activity.handler;

import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityContextInfo;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.dto.activity.DatasetFieldEnumValuesActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.DatasetFieldValuesActivityStateDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.EnumValuePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveEnumValueRepository;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto.DATASET_FIELD_VALUES_UPDATED;
import static reactor.function.TupleUtils.function;

@Component
@RequiredArgsConstructor
public class DatasetFieldValuesUpdatedActivityHandler implements ActivityHandler {
    private final ReactiveEnumValueRepository enumValueRepository;
    private final ReactiveDatasetFieldRepository datasetFieldRepository;

    @Override
    public boolean isHandle(final ActivityEventTypeDto activityEventTypeDto) {
        return activityEventTypeDto == DATASET_FIELD_VALUES_UPDATED;
    }

    @Override
    public Mono<ActivityContextInfo> getContextInfo(final Map<String, Object> parameters) {
        final long datasetFieldId =
            (long) parameters.get(ActivityParameterNames.DatasetFieldInformationUpdated.DATASET_FIELD_ID);
        return Mono.zip(enumValueRepository.getEnumValuesByDatasetFieldId(datasetFieldId).collectList(),
                datasetFieldRepository.getDataEntityIdByDatasetFieldId(datasetFieldId),
                datasetFieldRepository.get(datasetFieldId))
            .map(function((enums, dataEntityId, pojo) -> ActivityContextInfo.builder()
                .oldState(getState(enums, pojo))
                .dataEntityId(dataEntityId)
                .build()));
    }

    @Override
    public Mono<String> getUpdatedState(final Map<String, Object> parameters, final Long dataEntityId) {
        final long datasetFieldId =
            (long) parameters.get(ActivityParameterNames.DatasetFieldInformationUpdated.DATASET_FIELD_ID);
        return Mono.zip(enumValueRepository.getEnumValuesByDatasetFieldId(datasetFieldId).collectList(),
                datasetFieldRepository.get(datasetFieldId))
            .map(function(this::getState));
    }

    private String getState(final List<EnumValuePojo> enumPojos, final DatasetFieldPojo pojo) {
        final List<DatasetFieldEnumValuesActivityStateDto> enums = enumPojos.stream()
            .map(e -> new DatasetFieldEnumValuesActivityStateDto(e.getId(), e.getName()))
            .toList();
        final DatasetFieldValuesActivityStateDto state =
            new DatasetFieldValuesActivityStateDto(pojo.getId(),
                pojo.getName(), pojo.getType(),
                pojo.getInternalDescription(), enums);
        return JSONSerDeUtils.serializeJson(state);
    }
}
