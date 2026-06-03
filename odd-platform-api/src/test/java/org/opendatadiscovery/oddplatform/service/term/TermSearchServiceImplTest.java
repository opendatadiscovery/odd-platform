package org.opendatadiscovery.oddplatform.service.term;

import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.MultipleFacetType;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.FacetStateMapper;
import org.opendatadiscovery.oddplatform.mapper.SearchMapper;
import org.opendatadiscovery.oddplatform.mapper.TermMapper;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchFacetRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for the term-search facet guard — validates F-024 (Term Search & Browse): every
 * facet-scoped read resolves the persisted search state first, and an unknown searchId errors NotFound
 * ("Search not found") via the shared fetchFacetState guard — exercised through getFacets, getSearchResults
 * and getFilterOptions. Mockito + StepVerifier; the downstream facet/result flatMaps are lazy and never run
 * on the empty state. No prior TermSearchServiceImpl unit test.
 *
 * @validates F-024
 */
@ExtendWith(MockitoExtension.class)
class TermSearchServiceImplTest {

    private static final UUID SEARCH_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    @Mock private FacetStateMapper facetStateMapper;
    @Mock private SearchMapper searchMapper;
    @Mock private TermMapper termMapper;
    @Mock private ReactiveTermRepository reactiveTermRepository;
    @Mock private ReactiveSearchFacetRepository reactiveSearchFacetRepository;

    private TermSearchService service;

    @BeforeEach
    void setUp() {
        service = new TermSearchServiceImpl(facetStateMapper, searchMapper, termMapper, reactiveTermRepository,
            reactiveSearchFacetRepository);
    }

    @Test
    void getFacets_unknownSearchId_errorsNotFound() {
        when(reactiveSearchFacetRepository.get(any())).thenReturn(Mono.empty());
        StepVerifier.create(service.getFacets(SEARCH_ID)).verifyError(NotFoundException.class);
    }

    @Test
    void getSearchResults_unknownSearchId_errorsNotFound() {
        when(reactiveSearchFacetRepository.get(any())).thenReturn(Mono.empty());
        StepVerifier.create(service.getSearchResults(SEARCH_ID, 1, 10)).verifyError(NotFoundException.class);
    }

    @Test
    void getFilterOptions_unknownSearchId_errorsNotFound() {
        when(reactiveSearchFacetRepository.get(any())).thenReturn(Mono.empty());
        StepVerifier.create(service.getFilterOptions(SEARCH_ID, MultipleFacetType.TAGS, 1, 10, null))
            .verifyError(NotFoundException.class);
    }
}
