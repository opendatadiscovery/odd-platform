package org.opendatadiscovery.oddplatform.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.InternalNameFormData;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.DatasetFieldApiMapper;
import org.opendatadiscovery.oddplatform.mapper.DatasetFieldListMapper;
import org.opendatadiscovery.oddplatform.mapper.EnumValueMapper;
import org.opendatadiscovery.oddplatform.mapper.TagMapper;
import org.opendatadiscovery.oddplatform.mapper.TermMapper;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveEnumValueRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTagRepository;
import org.opendatadiscovery.oddplatform.service.ingestion.DatasetVersionHashCalculator;
import org.opendatadiscovery.oddplatform.service.term.TermService;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for dataset-field internal-name authoring — validates F-178 (Entity Header
 * Authoring Surface — Internal Name): renaming the internal name of a dataset field that does not exist
 * errors NotFound (the repository update returns empty for an unknown id). Exercised with Mockito +
 * StepVerifier. The chain ends with an eager .then(updateDatasetFieldSearchVectors(...)) tail, which is
 * poison-stubbed (subscribe-only) to prove the not-found guard short-circuits before any search-vector
 * update. No prior DatasetFieldServiceImpl unit test.
 *
 * @validates F-178
 */
@ExtendWith(MockitoExtension.class)
class DatasetFieldServiceImplTest {

    private static final long FIELD_ID = 1L;

    @Mock private TagService tagService;
    @Mock private DataEntityFilledService dataEntityFilledService;
    @Mock private TermService termService;
    @Mock private DatasetFieldInternalInformationService datasetFieldInternalInformationService;
    @Mock private DatasetVersionHashCalculator datasetVersionHashCalculator;
    @Mock private ReactiveDatasetFieldRepository reactiveDatasetFieldRepository;
    @Mock private ReactiveTagRepository reactiveTagRepository;
    @Mock private ReactiveSearchEntrypointRepository reactiveSearchEntrypointRepository;
    @Mock private ReactiveEnumValueRepository enumValueRepository;
    @Mock private DatasetFieldApiMapper datasetFieldApiMapper;
    @Mock private TagMapper tagMapper;
    @Mock private EnumValueMapper enumValueMapper;
    @Mock private TermMapper termMapper;
    @Mock private DatasetFieldListMapper datasetFieldListMapper;

    private DatasetFieldService service;

    @BeforeEach
    void setUp() {
        service = new DatasetFieldServiceImpl(tagService, dataEntityFilledService, termService,
            datasetFieldInternalInformationService, datasetVersionHashCalculator, reactiveDatasetFieldRepository,
            reactiveTagRepository, reactiveSearchEntrypointRepository, enumValueRepository, datasetFieldApiMapper,
            tagMapper, enumValueMapper, termMapper, datasetFieldListMapper);
    }

    @Test
    void updateInternalName_nonExistentField_errorsNotFound() {
        when(reactiveDatasetFieldRepository.updateInternalName(anyLong(), any())).thenReturn(Mono.empty());
        when(reactiveSearchEntrypointRepository.updateDatasetFieldSearchVectors(anyLong()))
            .thenReturn(Mono.error(new AssertionError("updated search vectors despite the field not existing")));
        StepVerifier.create(service.updateInternalName(FIELD_ID, new InternalNameFormData()))
            .verifyError(NotFoundException.class);
    }
}
