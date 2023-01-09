package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityAlertConfig;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.AlertHaltConfigMapper;
import org.opendatadiscovery.oddplatform.repository.AlertHaltConfigRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.service.activity.ActivityLog;
import org.opendatadiscovery.oddplatform.service.activity.ActivityParameter;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.utils.ActivityParameterNames.AlertHaltConfigUpdated.DATA_ENTITY_ID;

@Service
@RequiredArgsConstructor
public class AlertHaltConfigServiceImpl implements AlertHaltConfigService {
    private final AlertHaltConfigRepository alertHaltConfigRepository;
    private final AlertHaltConfigMapper alertHaltConfigMapper;
    private final ReactiveDataEntityRepository dataEntityRepository;

    @Override
    public Mono<DataEntityAlertConfig> getAlertHaltConfig(final long dataEntityId) {
        return dataEntityRepository.exists(dataEntityId)
            .filter(exists -> exists)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("data entity", dataEntityId)))
            .then(alertHaltConfigRepository.get(dataEntityId))
            .map(alertHaltConfigMapper::mapPojo)
            .switchIfEmpty(Mono.just(new DataEntityAlertConfig()));
    }

    @Override
    @ActivityLog(event = ActivityEventTypeDto.ALERT_HALT_CONFIG_UPDATED)
    public Mono<DataEntityAlertConfig> saveAlertHaltConfig(@ActivityParameter(DATA_ENTITY_ID) final long dataEntityId,
                                                           final DataEntityAlertConfig config) {
        return alertHaltConfigRepository
            .create(alertHaltConfigMapper.mapForm(dataEntityId, config))
            .map(alertHaltConfigMapper::mapPojo);
    }
}
