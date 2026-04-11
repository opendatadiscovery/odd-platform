package org.opendatadiscovery.oddplatform.service.activity.handler;

import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldWithTagsDto;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityContextInfo;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.dto.activity.DatasetFieldInformationActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.DatasetFieldTagActivityStateDto;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldRepository;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames.DatasetFieldInformationUpdated;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import static reactor.function.TupleUtils.function;

@Component
@RequiredArgsConstructor
public class DatasetFieldInformationUpdatedActivityHandler implements ActivityHandler {
    private final ReactiveDatasetFieldRepository datasetFieldRepository;

    @Override
    public boolean isHandle(final ActivityEventTypeDto activityEventTypeDto) {
        return activityEventTypeDto == ActivityEventTypeDto.DATASET_FIELD_DESCRIPTION_UPDATED
            || activityEventTypeDto == ActivityEventTypeDto.DATASET_FIELD_TAGS_UPDATED
            || activityEventTypeDto == ActivityEventTypeDto.DATASET_FIELD_INTERNAL_NAME_UPDATED;
    }

    @Override
    public Mono<ActivityContextInfo> getContextInfo(final Map<String, Object> parameters) {
        final long datasetFieldId =
            (long) parameters.get(DatasetFieldInformationUpdated.DATASET_FIELD_ID);
        return Mono.zip(datasetFieldRepository.getDatasetFieldWithTags(datasetFieldId),
                datasetFieldRepository.getDataEntityIdByDatasetFieldId(datasetFieldId))
            .map(function((dto, dataEntityId) -> ActivityContextInfo.builder()
                .oldState(getState(dto))
                .dataEntityId(dataEntityId)
                .build()
            ));
    }

    @Override
    public Mono<String> getUpdatedState(final Map<String, Object> parameters, final Long dataEntityId) {
        final long datasetFieldId =
            (long) parameters.get(DatasetFieldInformationUpdated.DATASET_FIELD_ID);
        return datasetFieldRepository.getDatasetFieldWithTags(datasetFieldId)
            .map(this::getState);
    }

    private String getState(final DatasetFieldWithTagsDto dto) {
        final List<DatasetFieldTagActivityStateDto> tags;
        if (CollectionUtils.isEmpty(dto.tags())) {
            tags = List.of();
        } else {
            tags = dto.tags().stream()
                .map(l -> new DatasetFieldTagActivityStateDto(l.getId(), l.getName()))
                .toList();
        }
        final DatasetFieldInformationActivityStateDto state =
            new DatasetFieldInformationActivityStateDto(dto.datasetFieldPojo().getId(),
                dto.datasetFieldPojo().getName(), dto.datasetFieldPojo().getInternalName(),
                dto.datasetFieldPojo().getType(),
                dto.datasetFieldPojo().getInternalDescription(), tags);
        return JSONSerDeUtils.serializeJson(state);
    }
}
