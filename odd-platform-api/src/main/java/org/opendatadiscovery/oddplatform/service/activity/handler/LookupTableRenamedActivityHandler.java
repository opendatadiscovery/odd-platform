package org.opendatadiscovery.oddplatform.service.activity.handler;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityContextInfo;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.dto.activity.LookupTableNameActivityStateDto;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLookupTableRepository;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames.LookupTableRenamed;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class LookupTableRenamedActivityHandler implements ActivityHandler {
    private final ReactiveLookupTableRepository lookupTableRepository;

    @Override
    public boolean isHandle(final ActivityEventTypeDto activityEventTypeDto) {
        return activityEventTypeDto == ActivityEventTypeDto.LOOKUP_TABLE_RENAMED;
    }

    @Override
    public Mono<ActivityContextInfo> getContextInfo(final Map<String, Object> parameters) {
        final long lookupTableId = (long) parameters.get(LookupTableRenamed.LOOKUP_TABLE_ID);
        return lookupTableRepository.get(lookupTableId)
            .map(pojo -> ActivityContextInfo.builder()
                .dataEntityId(pojo.getDataEntityId())
                .oldState(getState(pojo.getName()))
                .build());
    }

    @Override
    public Mono<String> getUpdatedState(final Map<String, Object> parameters,
                                        final Long dataEntityId) {
        final long lookupTableId = (long) parameters.get(LookupTableRenamed.LOOKUP_TABLE_ID);
        return lookupTableRepository.get(lookupTableId)
            .map(pojo -> getState(pojo.getName()));
    }

    private String getState(final String name) {
        return JSONSerDeUtils.serializeJson(new LookupTableNameActivityStateDto(name));
    }
}
