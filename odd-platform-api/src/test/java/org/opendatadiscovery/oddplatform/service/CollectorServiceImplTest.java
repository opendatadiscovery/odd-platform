package org.opendatadiscovery.oddplatform.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.CollectorFormData;
import org.opendatadiscovery.oddplatform.exception.CascadeDeleteException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.CollectorMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.CollectorPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveCollectorRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataSourceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTokenRepository;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for the Collector lifecycle — validates F-020 (Collector Lifecycle Management):
 * a collector with associated data sources cannot be deleted (CascadeDeleteException, never deleted);
 * deleting an unassociated collector returns its id; deleting/updating/regenerating-token of a missing
 * collector errors NotFoundException. Exercised with Mockito + reactor-test StepVerifier. Surfaced from
 * the CollectorServiceImpl uncovered-behaviour test-gaps (no prior CollectorServiceImpl unit test).
 *
 * @validates F-020
 */
@ExtendWith(MockitoExtension.class)
class CollectorServiceImplTest {

    private static final long COLLECTOR_ID = 1L;

    @Mock private TokenGenerator tokenGenerator;
    @Mock private CollectorMapper collectorMapper;
    @Mock private ReactiveCollectorRepository collectorRepository;
    @Mock private NamespaceService namespaceService;
    @Mock private ReactiveTokenRepository tokenRepository;
    @Mock private ReactiveDataSourceRepository dataSourceRepository;

    private CollectorService service;

    @BeforeEach
    void setUp() {
        service = new CollectorServiceImpl(tokenGenerator, collectorMapper, collectorRepository,
            namespaceService, tokenRepository, dataSourceRepository);
    }

    @Test
    void update_nonExistentCollector_errorsNotFound() {
        when(collectorRepository.getDto(eq(COLLECTOR_ID))).thenReturn(Mono.empty());
        StepVerifier.create(service.update(COLLECTOR_ID, new CollectorFormData()))
            .verifyError(NotFoundException.class);
    }

    @Test
    void regenerateToken_nonExistentCollector_errorsNotFound() {
        when(collectorRepository.getDto(eq(COLLECTOR_ID))).thenReturn(Mono.empty());
        StepVerifier.create(service.regenerateToken(COLLECTOR_ID))
            .verifyError(NotFoundException.class);
    }

    @Test
    void delete_collectorWithAssociatedDataSources_errorsCascadeDeleteAndNeverDeletes() {
        when(dataSourceRepository.existsByCollector(eq(COLLECTOR_ID))).thenReturn(Mono.just(true));
        // delete() composes via eager .then(collectorRepository.delete(id)) — poison fires only if the
        // cascade-blocked path wrongly subscribes the delete (it must not).
        when(collectorRepository.delete(anyLong()))
            .thenReturn(Mono.error(new AssertionError("collector deleted despite associated data sources")));

        StepVerifier.create(service.delete(COLLECTOR_ID)).verifyError(CascadeDeleteException.class);
    }

    @Test
    void delete_collectorWithoutDataSources_deletesAndReturnsId() {
        when(dataSourceRepository.existsByCollector(eq(COLLECTOR_ID))).thenReturn(Mono.just(false));
        when(collectorRepository.delete(eq(COLLECTOR_ID)))
            .thenReturn(Mono.just(new CollectorPojo().setId(COLLECTOR_ID)));

        StepVerifier.create(service.delete(COLLECTOR_ID))
            .assertNext(id -> assertThat(id).isEqualTo(COLLECTOR_ID))
            .verifyComplete();
    }

    @Test
    void delete_collectorNotFound_errorsNotFound() {
        when(dataSourceRepository.existsByCollector(eq(COLLECTOR_ID))).thenReturn(Mono.just(false));
        when(collectorRepository.delete(eq(COLLECTOR_ID))).thenReturn(Mono.empty());

        StepVerifier.create(service.delete(COLLECTOR_ID)).verifyError(NotFoundException.class);
    }
}
