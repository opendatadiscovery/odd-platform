package org.opendatadiscovery.oddplatform.service.activity.handler;

import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityContextInfo;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.dto.activity.DatasetFieldTermsActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.TermActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.term.LinkedTermDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import reactor.function.TupleUtils;

import static reactor.function.TupleUtils.function;

@Component
@RequiredArgsConstructor
public class DatasetFieldTermAssignmentActivityHandler implements ActivityHandler {
    private final ReactiveDatasetFieldRepository datasetFieldRepository;
    private final ReactiveTermRepository termRepository;

    @Override
    public boolean isHandle(final ActivityEventTypeDto activityEventTypeDto) {
        return activityEventTypeDto == ActivityEventTypeDto.DATASET_FIELD_TERM_ASSIGNMENT_UPDATED;
    }

    @Override
    public Mono<ActivityContextInfo> getContextInfo(final Map<String, Object> parameters) {
        final long datasetFieldId = (long) parameters.get(ActivityParameterNames.FieldTermAssignment.DATASET_FIELD_ID);
        return Mono.zip(getTermsStateByDatasetFieldId(datasetFieldId),
                datasetFieldRepository.getDataEntityIdByDatasetFieldId(datasetFieldId),
                datasetFieldRepository.get(datasetFieldId))
            .map(TupleUtils.function((terms, dataEntityId, pojo) -> ActivityContextInfo.builder()
                .oldState(getState(terms, pojo))
                .dataEntityId(dataEntityId)
                .build()));
    }

    @Override
    public Mono<String> getUpdatedState(final Map<String, Object> parameters, final Long dataEntityId) {
        final long datasetFieldId = (long) parameters.get(ActivityParameterNames.FieldTermAssignment.DATASET_FIELD_ID);
        return Mono.zip(getTermsStateByDatasetFieldId(datasetFieldId), datasetFieldRepository.get(datasetFieldId))
            .map(function(this::getState));
    }

    private Mono<List<TermActivityStateDto>> getTermsStateByDatasetFieldId(final Long datasetFieldId) {
        return termRepository.getDatasetFieldTerms(datasetFieldId)
            .map(this::mapTerm)
            .collectList();
    }

    private String getState(final List<TermActivityStateDto> terms, final DatasetFieldPojo pojo) {
        final DatasetFieldTermsActivityStateDto state = new DatasetFieldTermsActivityStateDto(pojo.getId(),
            pojo.getName(), pojo.getType(), terms);
        return JSONSerDeUtils.serializeJson(state);
    }

    private TermActivityStateDto mapTerm(final LinkedTermDto dto) {
        final TermPojo pojo = dto.term().getTerm();
        final NamespacePojo namespace = dto.term().getNamespace();
        return new TermActivityStateDto(pojo.getId(), pojo.getName(), namespace.getName(), dto.isDescriptionLink());
    }
}
