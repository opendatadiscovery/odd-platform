package org.opendatadiscovery.oddplatform.service.term;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.TermFormData;
import org.opendatadiscovery.oddplatform.dto.term.TermRefDto;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.TagMapper;
import org.opendatadiscovery.oddplatform.mapper.TermMapper;
import org.opendatadiscovery.oddplatform.repository.reactive.DataEntityDescriptionUnhandledTermRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.DatasetFieldDescriptionUnhandledTermRepositoryImpl;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.TermDefinitionUnhandledTermRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.TermRelationsRepository;
import org.opendatadiscovery.oddplatform.service.DataEntityFilledService;
import org.opendatadiscovery.oddplatform.service.NamespaceService;
import org.opendatadiscovery.oddplatform.service.TagService;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for the dictionary Term lifecycle guards — validates F-024 (Term Search & Browse),
 * F-154 (Term Create / Edit Form) and F-002 (Term-to-Entity Linkage):
 *  - reading a term by namespace+name that doesn't exist errors NotFound;
 *  - creating a term whose name already exists in the namespace errors BadUserRequest (duplicate guard,
 *    before the deferred create chain runs);
 *  - updating a non-existent term errors NotFound;
 *  - deleting a term that is mentioned in a description errors BadUserRequest, and NO relation/term row is
 *    deleted (the eager .thenMany/.then deletion tails are poison-stubbed to prove short-circuit);
 *  - linking a term to a data entity it is already assigned to errors BadUserRequest.
 * Exercised with Mockito + StepVerifier. No prior TermServiceImpl unit test.
 *
 * @validates F-024
 * @validates F-154
 * @validates F-002
 */
@ExtendWith(MockitoExtension.class)
class TermServiceImplTest {

    @Mock private NamespaceService namespaceService;
    @Mock private TagService tagService;
    @Mock private DataEntityFilledService dataEntityFilledService;
    @Mock private ReactiveTermRepository termRepository;
    @Mock private TermRelationsRepository termRelationsRepository;
    @Mock private TermDefinitionUnhandledTermRepository termDefinitionUnhandledTermRepository;
    @Mock private ReactiveTermSearchEntrypointRepository termSearchEntrypointRepository;
    @Mock private DataEntityDescriptionUnhandledTermRepository dataEntityDescriptionUnhandledTermRepository;
    @Mock private DatasetFieldDescriptionUnhandledTermRepositoryImpl datasetFieldDescriptionUnhandledTermRepository;
    @Mock private TermMapper termMapper;
    @Mock private TagMapper tagMapper;

    private TermService service;

    @BeforeEach
    void setUp() {
        service = new TermServiceImpl(namespaceService, tagService, dataEntityFilledService, termRepository,
            termRelationsRepository, termDefinitionUnhandledTermRepository, termSearchEntrypointRepository,
            dataEntityDescriptionUnhandledTermRepository, datasetFieldDescriptionUnhandledTermRepository,
            termMapper, tagMapper);
    }

    @Test
    void getTermByNamespaceAndName_unknown_errorsNotFound() {
        when(termRepository.getByNameAndNamespace(any(), any())).thenReturn(Mono.empty());
        StepVerifier.create(service.getTermByNamespaceAndName("ns", "name")).verifyError(NotFoundException.class);
    }

    @Test
    void createTerm_duplicateNameInNamespace_errorsBadRequest() {
        when(termRepository.getByNameAndNamespace(any(), any())).thenReturn(Mono.just(TermRefDto.builder().build()));
        StepVerifier.create(service.createTerm(new TermFormData())).verifyError(BadUserRequestException.class);
    }

    @Test
    void updateTerm_nonExistent_errorsNotFound() {
        when(termRepository.getTermRefDto(any())).thenReturn(Mono.empty());
        StepVerifier.create(service.updateTerm(1L, new TermFormData())).verifyError(NotFoundException.class);
    }

    @Test
    void delete_termMentionedInDescription_errorsBadRequest() {
        when(termRepository.hasDescriptionRelations(anyLong())).thenReturn(Mono.just(true));
        when(termRelationsRepository.deleteRelationsWithDataEntities(anyLong()))
            .thenReturn(Flux.error(new AssertionError("deleted DE relations despite the description-mention guard")));
        when(termRelationsRepository.deleteRelationsWithDatasetFields(anyLong()))
            .thenReturn(Flux.error(new AssertionError("deleted DF relations despite the description-mention guard")));
        when(termRepository.delete(anyLong()))
            .thenReturn(Mono.error(new AssertionError("deleted term despite the description-mention guard")));
        StepVerifier.create(service.delete(1L)).verifyError(BadUserRequestException.class);
    }

    @Test
    void linkTermWithDataEntity_alreadyAssigned_errorsBadRequest() {
        when(termRelationsRepository.createRelationWithDataEntity(anyLong(), anyLong())).thenReturn(Mono.empty());
        StepVerifier.create(service.linkTermWithDataEntity(1L, 2L)).verifyError(BadUserRequestException.class);
    }
}
