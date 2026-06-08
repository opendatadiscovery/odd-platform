package org.opendatadiscovery.oddplatform.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldDescriptionUpdateFormData;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for dataset-field description authoring — validates F-047 (Dataset Field
 * per-Column Annotation Surface): updating the description of a dataset field that does not exist errors
 * NotFound (the repository update returns empty for an unknown id). Exercised with Mockito +
 * StepVerifier; the downstream filled-marking and search-vector flatMaps are lazy and short-circuit on
 * the empty upstream. No prior DatasetFieldInternalInformationServiceImpl unit test.
 *
 * @validates F-047
 */
@ExtendWith(MockitoExtension.class)
class DatasetFieldInternalInformationServiceImplTest {

    private static final long FIELD_ID = 1L;

    @Mock private ReactiveDatasetFieldRepository reactiveDatasetFieldRepository;
    @Mock private ReactiveSearchEntrypointRepository reactiveSearchEntrypointRepository;
    @Mock private DataEntityFilledService dataEntityFilledService;

    private DatasetFieldInternalInformationService service;

    @BeforeEach
    void setUp() {
        service = new DatasetFieldInternalInformationServiceImpl(reactiveDatasetFieldRepository,
            reactiveSearchEntrypointRepository, dataEntityFilledService);
    }

    @Test
    void updateDescription_nonExistentField_errorsNotFound() {
        when(reactiveDatasetFieldRepository.updateDescription(anyLong(), any())).thenReturn(Mono.empty());
        StepVerifier.create(service.updateDescription(FIELD_ID, new DatasetFieldDescriptionUpdateFormData()))
            .verifyError(NotFoundException.class);
    }
}
