package org.opendatadiscovery.oddplatform.service.activity.handler;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.activity.TermActivityStateDto;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
public abstract class AbstractTermActivityHandler {
    private final ReactiveTermRepository reactiveTermRepository;

    protected Mono<String> getStateByDataEntityId(final Long dataEntityId) {
        return reactiveTermRepository.getDataEntityTerms(dataEntityId)
            .map(dto -> new TermActivityStateDto(dto.getTerm().getId(),
                dto.getTerm().getName(), dto.getNamespace().getName()))
            .collectList()
            .map(this::getState);
    }

    private String getState(final List<TermActivityStateDto> state) {
        return JSONSerDeUtils.serializeJson(state);
    }
}
