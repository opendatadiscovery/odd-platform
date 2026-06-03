package org.opendatadiscovery.oddplatform.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleFormData;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.QueryExampleMapper;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityQueryExampleRelationRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermQueryExampleRelationRepository;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for the query-example lifecycle — validates F-025 (Query Examples CRUD + Faceted
 * Search): updating a query example that does not exist errors NotFound; and creating a dataset
 * relationship that already exists errors BadUserRequest. Exercised with Mockito + StepVerifier.
 * createQueryExampleToDatasetRelationship composes via eager .then(getQueryExampleDatasetRelations(...))
 * AND eager .zipWith(updateQueryExampleVectorsForDataEntity(...)); both tails are poison-stubbed
 * (subscribe-only) to prove the already-assigned guard short-circuits before any relation read or search
 * vector update. No prior QueryExampleServiceImpl unit test.
 *
 * @validates F-025
 */
@ExtendWith(MockitoExtension.class)
class QueryExampleServiceImplTest {

    private static final long EXAMPLE_ID = 1L;
    private static final long DATASET_ID = 2L;

    @Mock private ReactiveQueryExampleRepository queryExampleRepository;
    @Mock private ReactiveQueryExampleSearchEntrypointRepository queryExampleSearchEntrypointRepository;
    @Mock private ReactiveDataEntityQueryExampleRelationRepository dataEntityToQueryExampleRepository;
    @Mock private ReactiveTermQueryExampleRelationRepository termQueryExampleRelationRepository;
    @Mock private DataEntityService dataEntityService;
    @Mock private QueryExampleMapper queryExampleMapper;

    private QueryExampleService service;

    @BeforeEach
    void setUp() {
        service = new QueryExampleServiceImpl(queryExampleRepository, queryExampleSearchEntrypointRepository,
            dataEntityToQueryExampleRepository, termQueryExampleRelationRepository, dataEntityService,
            queryExampleMapper);
    }

    @Test
    void updateQueryExample_nonExistent_errorsNotFound() {
        when(queryExampleRepository.get(anyLong())).thenReturn(Mono.empty());
        StepVerifier.create(service.updateQueryExample(EXAMPLE_ID, new QueryExampleFormData()))
            .verifyError(NotFoundException.class);
    }

    @Test
    void createQueryExampleToDatasetRelationship_alreadyAssigned_errorsBadRequest() {
        // An empty create-relation result means the dataset is already assigned to this query example.
        when(dataEntityToQueryExampleRepository.createRelationWithDataEntity(anyLong(), anyLong()))
            .thenReturn(Mono.empty());
        when(dataEntityToQueryExampleRepository.getQueryExampleDatasetRelations(anyLong()))
            .thenReturn(Mono.error(new AssertionError("read relations despite the dataset already being assigned")));
        when(queryExampleSearchEntrypointRepository.updateQueryExampleVectorsForDataEntity(anyLong()))
            .thenReturn(Mono.error(new AssertionError("updated search vectors despite the duplicate-assign guard")));

        StepVerifier.create(service.createQueryExampleToDatasetRelationship(EXAMPLE_ID, DATASET_ID))
            .verifyError(BadUserRequestException.class);
    }
}
