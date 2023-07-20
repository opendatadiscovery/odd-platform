package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.InternalDescriptionFormData;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.service.activity.ActivityLog;
import org.opendatadiscovery.oddplatform.service.activity.ActivityParameter;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.dto.DataEntityFilledField.INTERNAL_DESCRIPTION;
import static org.opendatadiscovery.oddplatform.utils.ActivityParameterNames.DescriptionUpdated.DATA_ENTITY_ID;

@Service
@RequiredArgsConstructor
public class DataEntityInternalInformationServiceImpl implements DataEntityInternalInformationService {
    private final ReactiveDataEntityRepository reactiveDataEntityRepository;
    private final ReactiveSearchEntrypointRepository reactiveSearchEntrypointRepository;
    private final DataEntityFilledService dataEntityFilledService;

    @Override
    @ReactiveTransactional
    @ActivityLog(event = ActivityEventTypeDto.DESCRIPTION_UPDATED)
    public Mono<DataEntityPojo> updateDescription(@ActivityParameter(DATA_ENTITY_ID) final long dataEntityId,
                                                  final InternalDescriptionFormData formData) {
        return reactiveDataEntityRepository.setInternalDescription(dataEntityId, formData.getInternalDescription())
            .flatMap(pojo -> reactiveSearchEntrypointRepository.updateDataEntityVectors(dataEntityId)
                .thenReturn(pojo))
            .flatMap(pojo -> {
                if (StringUtils.isNotEmpty(pojo.getInternalDescription())) {
                    return dataEntityFilledService.markEntityFilled(dataEntityId, INTERNAL_DESCRIPTION)
                        .thenReturn(pojo);
                } else {
                    return dataEntityFilledService.markEntityUnfilled(dataEntityId, INTERNAL_DESCRIPTION)
                        .thenReturn(pojo);
                }
            });
    }
}
