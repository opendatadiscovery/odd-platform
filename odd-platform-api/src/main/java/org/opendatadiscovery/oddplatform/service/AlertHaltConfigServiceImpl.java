package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityAlertConfig;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.AlertHaltConfigMapper;
import org.opendatadiscovery.oddplatform.repository.AlertHaltConfigRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

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
    public Mono<DataEntityAlertConfig> saveAlertHaltConfig(final long dataEntityId,
                                                           final DataEntityAlertConfig config) {
        return alertHaltConfigRepository
            .create(alertHaltConfigMapper.mapForm(dataEntityId, config))
            .map(alertHaltConfigMapper::mapPojo);
    }
}

