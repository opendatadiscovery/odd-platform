package org.opendatadiscovery.oddplatform.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.DataEntityMapper;
import org.opendatadiscovery.oddplatform.mapper.DataQualityMapper;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataQualityRepository;
import org.opendatadiscovery.oddplatform.service.sla.SLACalculator;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for data-quality reads — validates F-022 (Per-Dataset Data Quality Test Reports
 * & SLA): a dataset with no data-quality test oddrns errors NotFound; and a test report for a dataset
 * that does not exist errors NotFound. Exercised with Mockito + StepVerifier. getDatasetTestReport
 * composes via eager .then(getDatasetTestReport(...)), so that tail is poison-stubbed (subscribe-only)
 * to prove the existence guard short-circuits before the report query runs. No prior DataQualityServiceImpl
 * unit test.
 *
 * @validates F-022
 */
@ExtendWith(MockitoExtension.class)
class DataQualityServiceImplTest {

    private static final long DATASET_ID = 1L;

    @Mock private ReactiveDataQualityRepository dataQualityRepository;
    @Mock private ReactiveDataEntityRepository reactiveDataEntityRepository;
    @Mock private DataEntityService dataEntityService;
    @Mock private DataQualityMapper dataQualityMapper;
    @Mock private DataEntityMapper dataEntityMapper;
    @Mock private SLACalculator slaCalculator;

    private DataQualityService service;

    @BeforeEach
    void setUp() {
        service = new DataQualityServiceImpl(dataQualityRepository, reactiveDataEntityRepository,
            dataEntityService, dataQualityMapper, dataEntityMapper, slaCalculator);
    }

    @Test
    void getDatasetTests_noTestsForDataset_errorsNotFound() {
        when(dataQualityRepository.getDataQualityTestOddrnsForDataset(anyLong())).thenReturn(Flux.empty());
        StepVerifier.create(service.getDatasetTests(DATASET_ID)).verifyError(NotFoundException.class);
    }

    @Test
    void getDatasetTestReport_datasetDoesNotExist_errorsNotFound() {
        when(reactiveDataEntityRepository.existsIncludingSoftDeleted(anyLong())).thenReturn(Mono.just(false));
        when(dataQualityRepository.getDatasetTestReport(anyLong()))
            .thenReturn(Mono.error(new AssertionError("queried the test report despite the dataset not existing")));
        StepVerifier.create(service.getDatasetTestReport(DATASET_ID)).verifyError(NotFoundException.class);
    }
}
