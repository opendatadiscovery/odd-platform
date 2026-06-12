package org.opendatadiscovery.oddplatform.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceUpdateFormData;
import org.opendatadiscovery.oddplatform.exception.CascadeDeleteException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.DataSourceMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataSourceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTokenRepository;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for the Data Source lifecycle — validates F-031 (Data Source Lifecycle Management):
 * a data source with non-deleted data entities cannot be deleted (CascadeDeleteException, never deleted);
 * an unattached one deletes and returns its id; update/regenerate-token of a missing data source error
 * NotFoundException. Exercised with Mockito + reactor-test StepVerifier. delete() uses a lazy flatMap, so
 * the cascade test directly verifies delete is never invoked. No prior DataSourceServiceImpl unit test.
 *
 * @validates F-031
 */
@ExtendWith(MockitoExtension.class)
class DataSourceServiceImplTest {

    private static final long DS_ID = 1L;

    @Mock private DataSourceMapper dataSourceMapper;
    @Mock private TokenGenerator tokenGenerator;
    @Mock private ReactiveDataSourceRepository dataSourceRepository;
    @Mock private ReactiveDataEntityRepository dataEntityRepository;
    @Mock private ReactiveTokenRepository tokenRepository;
    @Mock private NamespaceService namespaceService;
    @Mock private ReactiveSearchEntrypointRepository searchEntrypointRepository;

    private DataSourceService service;

    @BeforeEach
    void setUp() {
        service = new DataSourceServiceImpl(dataSourceMapper, tokenGenerator, dataSourceRepository,
            dataEntityRepository, tokenRepository, namespaceService, searchEntrypointRepository);
    }

    @Test
    void update_nonExistentDataSource_errorsNotFound() {
        when(dataSourceRepository.getDto(eq(DS_ID))).thenReturn(Mono.empty());
        StepVerifier.create(service.update(DS_ID, new DataSourceUpdateFormData()))
            .verifyError(NotFoundException.class);
    }

    @Test
    void regenerateDataSourceToken_nonExistentDataSource_errorsNotFound() {
        when(dataSourceRepository.getDto(eq(DS_ID))).thenReturn(Mono.empty());
        StepVerifier.create(service.regenerateDataSourceToken(DS_ID))
            .verifyError(NotFoundException.class);
    }

    @Test
    void delete_dataSourceWithDataEntities_errorsCascadeDeleteWithoutDeleting() {
        when(dataEntityRepository.existsNonDeletedByDataSourceId(eq(DS_ID))).thenReturn(Mono.just(true));

        StepVerifier.create(service.delete(DS_ID)).verifyError(CascadeDeleteException.class);

        verify(dataSourceRepository, never()).delete(anyLong());
    }

    @Test
    void delete_dataSourceWithoutDataEntities_deletesAndReturnsId() {
        when(dataEntityRepository.existsNonDeletedByDataSourceId(eq(DS_ID))).thenReturn(Mono.just(false));
        when(dataSourceRepository.delete(eq(DS_ID))).thenReturn(Mono.just(new DataSourcePojo().setId(DS_ID)));

        StepVerifier.create(service.delete(DS_ID))
            .assertNext(id -> assertThat(id).isEqualTo(DS_ID))
            .verifyComplete();
    }
}
