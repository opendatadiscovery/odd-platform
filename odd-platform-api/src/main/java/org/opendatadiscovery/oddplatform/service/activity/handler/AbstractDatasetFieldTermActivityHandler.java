package org.opendatadiscovery.oddplatform.service.activity.handler;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.activity.DatasetFieldTermsActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.TermActivityStateDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
public abstract class AbstractDatasetFieldTermActivityHandler {
    private final ReactiveTermRepository reactiveTermRepository;

    protected Mono<List<TermActivityStateDto>> getTermsStateByDatasetFieldId(final Long datasetFieldId) {
        return reactiveTermRepository.getDatasetFieldTerms(datasetFieldId)
            .map(dto -> new TermActivityStateDto(dto.getTerm().getId(),
                dto.getTerm().getName(), dto.getNamespace().getName()))
            .collectList();
    }

    protected String getState(final List<TermActivityStateDto> terms, final DatasetFieldPojo pojo) {
        final DatasetFieldTermsActivityStateDto state = new DatasetFieldTermsActivityStateDto(pojo.getId(),
            pojo.getName(), pojo.getType(), terms);
        return JSONSerDeUtils.serializeJson(state);
    }
}
