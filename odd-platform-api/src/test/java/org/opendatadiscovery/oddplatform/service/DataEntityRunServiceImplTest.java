package org.opendatadiscovery.oddplatform.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.DataEntityRunMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityTaskRunRepository;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for DQ/transformer run history — validates F-040 (DQ Test Run History): runs are
 * only available for entities whose class actually produces runs (DATA_TRANSFORMER / DATA_QUALITY_TEST);
 * requesting runs for an entity of any other class errors BadUserRequest, and a missing entity errors
 * NotFound. Exercised with Mockito + StepVerifier. No prior DataEntityRunServiceImpl unit test.
 *
 * @validates F-040
 */
@ExtendWith(MockitoExtension.class)
class DataEntityRunServiceImplTest {

    private static final long DE_ID = 1L;

    @Mock private ReactiveDataEntityTaskRunRepository dataEntityRunRepository;
    @Mock private ReactiveDataEntityRepository dataEntityRepository;
    @Mock private DataEntityRunMapper dataEntityRunMapper;

    private DataEntityRunService service;

    @BeforeEach
    void setUp() {
        service = new DataEntityRunServiceImpl(dataEntityRunRepository, dataEntityRepository, dataEntityRunMapper);
    }

    @Test
    void getDataEntityRuns_nonExistentEntity_errorsNotFound() {
        when(dataEntityRepository.get(eq(DE_ID))).thenReturn(Mono.empty());
        StepVerifier.create(service.getDataEntityRuns(DE_ID, null, 1, 10))
            .verifyError(NotFoundException.class);
    }

    @Test
    void getDataEntityRuns_entityClassDoesNotSupportRuns_errorsBadRequest() {
        // An entity with no runs-capable class (neither DATA_TRANSFORMER nor DATA_QUALITY_TEST).
        when(dataEntityRepository.get(eq(DE_ID)))
            .thenReturn(Mono.just(new DataEntityPojo().setEntityClassIds(new Integer[] {})));
        StepVerifier.create(service.getDataEntityRuns(DE_ID, null, 1, 10))
            .verifyError(BadUserRequestException.class);
    }
}
