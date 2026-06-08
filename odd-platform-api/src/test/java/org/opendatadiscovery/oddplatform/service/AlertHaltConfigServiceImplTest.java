package org.opendatadiscovery.oddplatform.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityAlertConfig;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.AlertHaltConfigMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertHaltConfigPojo;
import org.opendatadiscovery.oddplatform.repository.AlertHaltConfigRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for the alert-halt-config surface — validates F-007 (AlertManager Integration):
 * reading the halt-config of a non-existent data entity errors NotFound; an existing entity WITH a config
 * returns the mapped config; an existing entity WITHOUT a config returns an empty default (not an error);
 * saving persists via the mapper+repository and returns the mapped result. Exercised with Mockito +
 * StepVerifier. No prior AlertHaltConfigServiceImpl unit test.
 *
 * @validates F-007
 */
@ExtendWith(MockitoExtension.class)
class AlertHaltConfigServiceImplTest {

    private static final long DE_ID = 1L;

    @Mock private AlertHaltConfigRepository alertHaltConfigRepository;
    @Mock private AlertHaltConfigMapper alertHaltConfigMapper;
    @Mock private ReactiveDataEntityRepository dataEntityRepository;

    private AlertHaltConfigService service;

    @BeforeEach
    void setUp() {
        service = new AlertHaltConfigServiceImpl(alertHaltConfigRepository, alertHaltConfigMapper,
            dataEntityRepository);
    }

    @Test
    void getAlertHaltConfig_nonExistentDataEntity_errorsNotFound() {
        when(dataEntityRepository.existsIncludingSoftDeleted(eq(DE_ID))).thenReturn(Mono.just(false));
        // .then(alertHaltConfigRepository.get(id)) is an eager arg — assembled but not subscribed on the
        // not-found path.
        when(alertHaltConfigRepository.get(anyLong())).thenReturn(Mono.empty());

        StepVerifier.create(service.getAlertHaltConfig(DE_ID)).verifyError(NotFoundException.class);
    }

    @Test
    void getAlertHaltConfig_existingEntityWithConfig_returnsMappedConfig() {
        final DataEntityAlertConfig mapped = new DataEntityAlertConfig();
        when(dataEntityRepository.existsIncludingSoftDeleted(eq(DE_ID))).thenReturn(Mono.just(true));
        when(alertHaltConfigRepository.get(eq(DE_ID))).thenReturn(Mono.just(new AlertHaltConfigPojo()));
        when(alertHaltConfigMapper.mapPojo(any())).thenReturn(mapped);

        StepVerifier.create(service.getAlertHaltConfig(DE_ID))
            .assertNext(cfg -> assertThat(cfg).isSameAs(mapped))
            .verifyComplete();
    }

    @Test
    void getAlertHaltConfig_existingEntityWithoutConfig_returnsEmptyDefault() {
        when(dataEntityRepository.existsIncludingSoftDeleted(eq(DE_ID))).thenReturn(Mono.just(true));
        when(alertHaltConfigRepository.get(eq(DE_ID))).thenReturn(Mono.empty());

        StepVerifier.create(service.getAlertHaltConfig(DE_ID))
            .assertNext(cfg -> assertThat(cfg).isNotNull())
            .verifyComplete();
    }

    @Test
    void saveAlertHaltConfig_persistsAndReturnsMappedConfig() {
        final DataEntityAlertConfig form = new DataEntityAlertConfig();
        final DataEntityAlertConfig mapped = new DataEntityAlertConfig();
        final AlertHaltConfigPojo pojo = new AlertHaltConfigPojo();
        when(alertHaltConfigMapper.mapForm(eq(DE_ID), eq(form))).thenReturn(pojo);
        when(alertHaltConfigRepository.create(eq(pojo))).thenReturn(Mono.just(pojo));
        when(alertHaltConfigMapper.mapPojo(eq(pojo))).thenReturn(mapped);

        StepVerifier.create(service.saveAlertHaltConfig(DE_ID, form))
            .assertNext(cfg -> assertThat(cfg).isSameAs(mapped))
            .verifyComplete();
    }
}
