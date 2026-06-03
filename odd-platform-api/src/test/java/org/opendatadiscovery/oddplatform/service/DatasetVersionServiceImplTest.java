package org.opendatadiscovery.oddplatform.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.DatasetFieldApiMapper;
import org.opendatadiscovery.oddplatform.mapper.DatasetVersionMapper;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetVersionRepository;
import org.opendatadiscovery.oddplatform.service.ingestion.DatasetVersionHashCalculator;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for dataset schema-version reads — validates F-045 (Dataset Schema Revision
 * History): fetching a specific version that doesn't exist errors NotFound; fetching the latest version
 * of a dataset with no versions errors NotFound; requesting a diff of two IDENTICAL version ids errors
 * BadUserRequest before any query. Exercised with Mockito + StepVerifier. No prior DatasetVersionServiceImpl
 * unit test.
 *
 * @validates F-045
 */
@ExtendWith(MockitoExtension.class)
class DatasetVersionServiceImplTest {

    private static final long DATASET_ID = 1L;
    private static final long VERSION_ID = 2L;

    @Mock private ReactiveDatasetVersionRepository reactiveDatasetVersionRepository;
    @Mock private DatasetVersionMapper datasetVersionMapper;
    @Mock private DatasetFieldApiMapper datasetFieldApiMapper;
    @Mock private DatasetVersionHashCalculator datasetVersionHashCalculator;

    private DatasetVersionService service;

    @BeforeEach
    void setUp() {
        service = new DatasetVersionServiceImpl(reactiveDatasetVersionRepository, datasetVersionMapper,
            datasetFieldApiMapper, datasetVersionHashCalculator);
    }

    @Test
    void getDatasetVersion_nonExistentVersion_errorsNotFound() {
        when(reactiveDatasetVersionRepository.getDatasetVersion(anyLong())).thenReturn(Mono.empty());
        StepVerifier.create(service.getDatasetVersion(DATASET_ID, VERSION_ID))
            .verifyError(NotFoundException.class);
    }

    @Test
    void getLatestDatasetVersion_noVersions_errorsNotFound() {
        when(reactiveDatasetVersionRepository.getLatestDatasetVersion(anyLong())).thenReturn(Mono.empty());
        StepVerifier.create(service.getLatestDatasetVersion(DATASET_ID))
            .verifyError(NotFoundException.class);
    }

    @Test
    void getDatasetVersionDiff_identicalVersionIds_errorsBadRequest() {
        // Diff of a version against itself is rejected before any query runs.
        StepVerifier.create(service.getDatasetVersionDiff(DATASET_ID, VERSION_ID, VERSION_ID))
            .verifyError(BadUserRequestException.class);
    }
}
