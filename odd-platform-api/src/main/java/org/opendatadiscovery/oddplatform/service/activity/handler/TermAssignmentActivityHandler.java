package org.opendatadiscovery.oddplatform.service.activity.handler;

import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityContextInfo;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.dto.activity.TermActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.term.LinkedTermDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames.TermAssignment;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class TermAssignmentActivityHandler implements ActivityHandler {
    private final ReactiveTermRepository termRepository;

    @Override
    public boolean isHandle(final ActivityEventTypeDto activityEventTypeDto) {
        return activityEventTypeDto == ActivityEventTypeDto.TERM_ASSIGNMENT_UPDATED;
    }

    @Override
    public Mono<ActivityContextInfo> getContextInfo(final Map<String, Object> parameters) {
        final long dataEntityId = (long) parameters.get(TermAssignment.DATA_ENTITY_ID);
        return getStateByDataEntityId(dataEntityId)
            .map(state -> ActivityContextInfo.builder()
                .oldState(state)
                .dataEntityId(dataEntityId)
                .build()
            );
    }

    @Override
    public Mono<String> getUpdatedState(final Map<String, Object> parameters,
                                        final Long dataEntityId) {
        return getStateByDataEntityId(dataEntityId);
    }

    private Mono<String> getStateByDataEntityId(final Long dataEntityId) {
        return termRepository.getDataEntityTerms(dataEntityId)
            .map(this::mapTerm)
            .collectList()
            .map(this::getState);
    }

    private String getState(final List<TermActivityStateDto> state) {
        return JSONSerDeUtils.serializeJson(state);
    }

    private TermActivityStateDto mapTerm(final LinkedTermDto dto) {
        final TermPojo pojo = dto.term().getTerm();
        final NamespacePojo namespace = dto.term().getNamespace();
        return new TermActivityStateDto(pojo.getId(), pojo.getName(), namespace.getName(), dto.isDescriptionLink());
    }
}
