package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldDescriptionUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.DataEntityFilledField;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.service.activity.ActivityLog;
import org.opendatadiscovery.oddplatform.service.activity.ActivityParameter;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames.DatasetFieldInformationUpdated;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class DatasetFieldInternalInformationServiceImpl implements DatasetFieldInternalInformationService {
    private final ReactiveDatasetFieldRepository reactiveDatasetFieldRepository;
    private final ReactiveSearchEntrypointRepository reactiveSearchEntrypointRepository;
    private final DataEntityFilledService dataEntityFilledService;

    @Override
    @ReactiveTransactional
    @ActivityLog(event = ActivityEventTypeDto.DATASET_FIELD_DESCRIPTION_UPDATED)
    public Mono<DatasetFieldPojo> updateDescription(
        @ActivityParameter(DatasetFieldInformationUpdated.DATASET_FIELD_ID) final long datasetFieldId,
        final DatasetFieldDescriptionUpdateFormData formData) {
        return reactiveDatasetFieldRepository.updateDescription(datasetFieldId, formData.getDescription())
            .switchIfEmpty(Mono.error(new NotFoundException("DatasetField", datasetFieldId)))
            .flatMap(pojo -> {
                if (StringUtils.isEmpty(pojo.getInternalDescription())) {
                    return dataEntityFilledService.markEntityUnfilledByDatasetFieldId(datasetFieldId,
                        DataEntityFilledField.DATASET_FIELD_DESCRIPTION).thenReturn(pojo);
                }
                return dataEntityFilledService.markEntityFilledByDatasetFieldId(datasetFieldId,
                    DataEntityFilledField.DATASET_FIELD_DESCRIPTION).thenReturn(pojo);
            })
            .flatMap(pojo -> reactiveSearchEntrypointRepository.updateDatasetFieldSearchVectors(datasetFieldId)
                .thenReturn(pojo));
    }
}
