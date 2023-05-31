package org.opendatadiscovery.oddplatform.service.activity.handler;

import java.util.Map;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityContextInfo;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import reactor.function.TupleUtils;

import static reactor.function.TupleUtils.function;

@Component
public class DatasetFieldTermAssignmentDeletedActivityHandler extends AbstractDatasetFieldTermActivityHandler
    implements ActivityHandler {
    private final ReactiveDatasetFieldRepository datasetFieldRepository;

    public DatasetFieldTermAssignmentDeletedActivityHandler(final ReactiveTermRepository reactiveTermRepository,
                                                            final ReactiveDatasetFieldRepository repository) {
        super(reactiveTermRepository);
        this.datasetFieldRepository = repository;
    }

    @Override
    public boolean isHandle(final ActivityEventTypeDto activityEventTypeDto) {
        return activityEventTypeDto == ActivityEventTypeDto.DATASET_FIELD_TERM_ASSIGNMENT_DELETED;
    }

    @Override
    public Mono<ActivityContextInfo> getContextInfo(final Map<String, Object> parameters) {
        final long datasetFieldId = (long) parameters.get(ActivityParameterNames.FieldTermAssigned.DATASET_FIELD_ID);
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
        final long datasetFieldId = (long) parameters.get(ActivityParameterNames.FieldTermAssigned.DATASET_FIELD_ID);
        return Mono.zip(getTermsStateByDatasetFieldId(datasetFieldId), datasetFieldRepository.get(datasetFieldId))
            .map(function(this::getState));
    }
}
