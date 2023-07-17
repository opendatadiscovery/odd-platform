package org.opendatadiscovery.oddplatform.service.activity.handler;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.activity.TermActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.term.LinkedTermDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.service.term.TermService;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
public abstract class AbstractTermActivityHandler {
    private final TermService termService;

    protected Mono<String> getStateByDataEntityId(final Long dataEntityId) {
        return termService.getDataEntityTerms(dataEntityId)
            .map(this::mapTerms)
            .map(this::getState);
    }

    private String getState(final List<TermActivityStateDto> state) {
        return JSONSerDeUtils.serializeJson(state);
    }

    private List<TermActivityStateDto> mapTerms(final List<LinkedTermDto> terms) {
        return terms.stream().map(dto -> {
            final TermPojo pojo = dto.term().getTerm();
            final NamespacePojo namespace = dto.term().getNamespace();
            return new TermActivityStateDto(pojo.getId(), pojo.getName(), namespace.getName(), dto.descriptionLink());
        }).toList();
    }
}
