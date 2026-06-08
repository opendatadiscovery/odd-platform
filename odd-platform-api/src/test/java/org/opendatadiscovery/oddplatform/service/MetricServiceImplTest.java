package org.opendatadiscovery.oddplatform.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldRepository;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for metric reads — validates F-030 (Metrics): requesting the latest metrics for a
 * data entity that does not exist, or for a dataset field that does not exist, errors NotFound (the
 * existence check precedes any metric read, so the MetricReader is never consulted). Exercised with
 * Mockito + StepVerifier; the .map(getOddrn).flatMap(metricReader) tail is lazy and short-circuits on the
 * empty upstream. No prior MetricServiceImpl unit test.
 *
 * @validates F-030
 */
@ExtendWith(MockitoExtension.class)
class MetricServiceImplTest {

    private static final long ID = 1L;

    @Mock private ReactiveDataEntityRepository dataEntityRepository;
    @Mock private ReactiveDatasetFieldRepository datasetFieldRepository;
    @Mock private MetricReader metricReader;

    private MetricService service;

    @BeforeEach
    void setUp() {
        service = new MetricServiceImpl(dataEntityRepository, datasetFieldRepository, metricReader);
    }

    @Test
    void getLatestMetricsForDataEntity_nonExistentEntity_errorsNotFound() {
        when(dataEntityRepository.get(anyLong())).thenReturn(Mono.empty());
        StepVerifier.create(service.getLatestMetricsForDataEntity(ID)).verifyError(NotFoundException.class);
    }

    @Test
    void getLatestMetricsForDatasetField_nonExistentField_errorsNotFound() {
        when(datasetFieldRepository.get(anyLong())).thenReturn(Mono.empty());
        StepVerifier.create(service.getLatestMetricsForDatasetField(ID)).verifyError(NotFoundException.class);
    }
}
