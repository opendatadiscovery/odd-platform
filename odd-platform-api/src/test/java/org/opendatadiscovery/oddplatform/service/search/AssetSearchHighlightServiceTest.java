package org.opendatadiscovery.oddplatform.service.search;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntitySearchHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleSearchHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.TermSearchHighlight;
import org.opendatadiscovery.oddplatform.dto.QueryExampleDto;
import org.opendatadiscovery.oddplatform.dto.term.TermDetailsDto;
import org.opendatadiscovery.oddplatform.dto.term.TermDto;
import org.opendatadiscovery.oddplatform.dto.term.TermRefDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityQueryExampleRelationRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.POLYMORPHIC_FIELD_CAP;

/**
 * The kind switch behind {@code GET /api/search/assets/{asset_kind}/{asset_id}/highlights} (ST-12 / #1846): the
 * Data Entity branch delegates to the existing service with the raw query; the Term and Query Example branches
 * build their documents and run them through the ONE shared sink with the raw query (the highlight consumes the
 * same tsquery as the match); a missing asset is not found.
 *
 * @validates F-017 (F-017-UC-19)
 */
@ExtendWith(MockitoExtension.class)
class AssetSearchHighlightServiceTest {

    @Mock
    private DataEntityHighlightService dataEntityHighlightService;
    @Mock
    private ReactiveDataEntityRepository dataEntityRepository;
    @Mock
    private ReactiveTermRepository termRepository;
    @Mock
    private ReactiveQueryExampleRepository queryExampleRepository;
    @Mock
    private ReactiveDataEntityQueryExampleRelationRepository queryExampleRelationRepository;
    @Mock
    private TermHighlightConverter termConverter;
    @Mock
    private QueryExampleHighlightConverter queryExampleConverter;
    @InjectMocks
    private AssetSearchHighlightServiceImpl service;

    private static TermDetailsDto term(final long id) {
        return TermDetailsDto.builder()
            .termDto(TermDto.builder()
                .termRefDto(TermRefDto.builder().term(new TermPojo().setId(id).setName("t")).build())
                .build())
            .build();
    }

    @Test
    void dataEntity_delegatesWithTheRawQuery() {
        final DataEntitySearchHighlight de = new DataEntitySearchHighlight();
        when(dataEntityHighlightService.highlightDataEntity("\"exact phrase\" -no", 7L)).thenReturn(Mono.just(de));

        StepVerifier.create(service.highlight(AssetKind.DATA_ENTITY, 7L, "\"exact phrase\" -no"))
            .assertNext(h -> {
                assertThat(h.getAssetKind()).isEqualTo(AssetKind.DATA_ENTITY);
                assertThat(h.getDataEntity()).isSameAs(de);
                assertThat(h.getTerm()).isNull();
                assertThat(h.getQueryExample()).isNull();
            })
            .verifyComplete();
        verify(dataEntityRepository, never()).getHighlightedResult(anyString(), anyString());
    }

    @Test
    void term_convertsWithTheCap_runsTheSharedSinkWithTheRawQuery_parses() {
        final TermDetailsDto details = term(3L);
        final TermSearchHighlight parsed = new TermSearchHighlight().name("x");
        when(termRepository.getTermDetailsDto(3L)).thenReturn(Mono.just(details));
        when(termConverter.convert(details, POLYMORPHIC_FIELD_CAP)).thenReturn("term-doc");
        when(dataEntityRepository.getHighlightedResult("term-doc", "rev or cost")).thenReturn(Mono.just("marked"));
        when(termConverter.parse("marked", details)).thenReturn(parsed);

        StepVerifier.create(service.highlight(AssetKind.TERM, 3L, "rev or cost"))
            .assertNext(h -> {
                assertThat(h.getAssetKind()).isEqualTo(AssetKind.TERM);
                assertThat(h.getTerm()).isSameAs(parsed);
                assertThat(h.getDataEntity()).isNull();
            })
            .verifyComplete();
        verify(dataEntityHighlightService, never()).highlightDataEntity(anyString(), eq(3L));
    }

    @Test
    void term_missingOrSoftDeleted_isNotFound() {
        when(termRepository.getTermDetailsDto(404L)).thenReturn(Mono.empty());

        StepVerifier.create(service.highlight(AssetKind.TERM, 404L, "q"))
            .expectError(NotFoundException.class)
            .verify();
        verify(dataEntityRepository, never()).getHighlightedResult(anyString(), anyString());
    }

    @Test
    void queryExample_visibilityReadThenRelations_sharedSink_parses() {
        final QueryExampleDto dto =
            new QueryExampleDto(new QueryExamplePojo().setId(5L).setDefinition("d").setQuery("q"),
                List.of(), List.of());
        final QueryExampleSearchHighlight parsed = new QueryExampleSearchHighlight().query("x");
        when(queryExampleRepository.get(5L)).thenReturn(Mono.just(dto.queryExamplePojo()));
        when(queryExampleRelationRepository.getQueryExampleDatasetRelations(5L)).thenReturn(Mono.just(dto));
        when(queryExampleConverter.convert(dto, POLYMORPHIC_FIELD_CAP)).thenReturn("qe-doc");
        when(dataEntityRepository.getHighlightedResult("qe-doc", "orders")).thenReturn(Mono.just("marked"));
        when(queryExampleConverter.parse("marked")).thenReturn(parsed);

        StepVerifier.create(service.highlight(AssetKind.QUERY_EXAMPLE, 5L, "orders"))
            .assertNext(h -> {
                assertThat(h.getAssetKind()).isEqualTo(AssetKind.QUERY_EXAMPLE);
                assertThat(h.getQueryExample()).isSameAs(parsed);
            })
            .verifyComplete();
    }

    @Test
    void queryExample_missingOrSoftDeleted_isNotFound_beforeTheRelationsRead() {
        when(queryExampleRepository.get(404L)).thenReturn(Mono.empty());

        StepVerifier.create(service.highlight(AssetKind.QUERY_EXAMPLE, 404L, "q"))
            .expectError(NotFoundException.class)
            .verify();
        verify(queryExampleRelationRepository, never()).getQueryExampleDatasetRelations(any(Long.class));
    }

    @Test
    void nullQuery_isTreatedAsBlank() {
        when(dataEntityHighlightService.highlightDataEntity("", 7L))
            .thenReturn(Mono.just(new DataEntitySearchHighlight()));

        StepVerifier.create(service.highlight(AssetKind.DATA_ENTITY, 7L, null))
            .expectNextCount(1)
            .verifyComplete();
    }

    @Test
    void queryExample_visibleButWithoutARelationsRow_isNotFound_neverReachesTheSink() {
        when(queryExampleRepository.get(6L)).thenReturn(Mono.just(new QueryExamplePojo().setId(6L)));
        when(queryExampleRelationRepository.getQueryExampleDatasetRelations(6L)).thenReturn(Mono.empty());

        StepVerifier.create(service.highlight(AssetKind.QUERY_EXAMPLE, 6L, "q"))
            .expectError(NotFoundException.class)
            .verify();
        verify(dataEntityRepository, never()).getHighlightedResult(any(), any());
    }
}
