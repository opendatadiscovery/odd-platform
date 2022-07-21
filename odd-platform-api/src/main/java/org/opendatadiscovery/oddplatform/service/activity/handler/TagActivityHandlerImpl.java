package org.opendatadiscovery.oddplatform.service.activity.handler;

import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityContextInfo;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.dto.activity.TagActivityStateDto;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTagRepository;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class TagActivityHandlerImpl implements ActivityHandler {
    private final ReactiveTagRepository tagRepository;

    @Override
    public boolean isHandle(final ActivityEventTypeDto activityEventTypeDto) {
        return activityEventTypeDto == ActivityEventTypeDto.TAGS_ASSOCIATION_UPDATED;
    }

    @Override
    public Mono<ActivityContextInfo> getContextInfo(final Map<String, Object> parameters) {
        final long dataEntityId = (long) parameters.get(ActivityParameterNames.TagsAssociationUpdated.DATA_ENTITY_ID);
        return getTagsState(dataEntityId).map(state -> ActivityContextInfo.builder()
            .dataEntityId(dataEntityId)
            .oldState(state)
            .build());
    }

    @Override
    public Mono<String> getUpdatedState(final Map<String, Object> parameters,
                                        final Long dataEntityId) {
        return getTagsState(dataEntityId);
    }

    private Mono<String> getTagsState(final Long dataEntityId) {
        return tagRepository.listDataEntityDtos(dataEntityId)
            .map(tags -> tags.stream()
                .map(tag -> new TagActivityStateDto(
                    tag.tagPojo().getId(),
                    tag.tagPojo().getName(),
                    tag.tagPojo().getImportant()
                ))
                .toList())
            .map(this::getState);
    }

    private String getState(final List<TagActivityStateDto> tags) {
        return JSONSerDeUtils.serializeJson(tags);
    }
}