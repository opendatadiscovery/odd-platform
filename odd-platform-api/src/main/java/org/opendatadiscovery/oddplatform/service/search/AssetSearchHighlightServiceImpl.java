package org.opendatadiscovery.oddplatform.service.search;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetSearchHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleSearchHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.TermSearchHighlight;
import org.opendatadiscovery.oddplatform.dto.QueryExampleDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityQueryExampleRelationRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.POLYMORPHIC_FIELD_CAP;

/**
 * One entry, three kinds (ST-12 / #1846, ADR unified-asset-search D6): the Data Entity branch delegates to the
 * existing {@link DataEntityHighlightService} (the same converter and the same {@code ts_headline} sink the legacy
 * session endpoint uses — "DE keeps its rich highlights"); the Term and Query Example branches load the kind's own
 * fields through its visibility-filtered loader, build the kind's document, run it through the ONE shared sink
 * ({@code ReactiveDataEntityRepository#getHighlightedResult} — text + the user's query in, marked text out, the
 * query compiled by {@code JooqFTSHelper.tsQueryExpression} exactly as the search itself compiles it, #1840) and
 * parse the marks back per field. Nothing here runs on the page request; a client asks for one row at a time.
 */
@Service
@RequiredArgsConstructor
public class AssetSearchHighlightServiceImpl implements AssetSearchHighlightService {
    private final DataEntityHighlightService dataEntityHighlightService;
    private final ReactiveDataEntityRepository dataEntityRepository;
    private final ReactiveTermRepository termRepository;
    private final ReactiveQueryExampleRepository queryExampleRepository;
    private final ReactiveDataEntityQueryExampleRelationRepository queryExampleRelationRepository;
    private final TermHighlightConverter termConverter;
    private final QueryExampleHighlightConverter queryExampleConverter;

    @Override
    public Mono<AssetSearchHighlight> highlight(final AssetKind assetKind, final long assetId, final String query) {
        final String effectiveQuery = query == null ? "" : query;
        final AssetSearchHighlight result = new AssetSearchHighlight().assetKind(assetKind);
        return switch (assetKind) {
            case DATA_ENTITY -> dataEntityHighlightService.highlightDataEntity(effectiveQuery, assetId)
                .map(result::dataEntity);
            case TERM -> highlightTerm(assetId, effectiveQuery).map(result::term);
            case QUERY_EXAMPLE -> highlightQueryExample(assetId, effectiveQuery).map(result::queryExample);
        };
    }

    private Mono<TermSearchHighlight> highlightTerm(final long termId, final String query) {
        // getTermDetailsDto is filtered on TERM.DELETED_AT IS NULL - a soft-deleted term is simply not found.
        return termRepository.getTermDetailsDto(termId)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("Term", termId)))
            .flatMap(details -> highlightDocument(termConverter.convert(details, POLYMORPHIC_FIELD_CAP), query)
                .map(highlighted -> termConverter.parse(highlighted, details)));
    }

    private Mono<QueryExampleSearchHighlight> highlightQueryExample(final long queryExampleId, final String query) {
        // get() is the soft-delete-filtered CRUD read (deleted_at IS NULL); the relations query alone is not.
        return queryExampleRepository.get(queryExampleId)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("QueryExample", queryExampleId)))
            .flatMap(visible -> queryExampleRelationRepository.getQueryExampleDatasetRelations(queryExampleId))
            .switchIfEmpty(Mono.error(() -> new NotFoundException("QueryExample", queryExampleId)))
            .flatMap((QueryExampleDto dto) ->
                highlightDocument(queryExampleConverter.convert(dto, POLYMORPHIC_FIELD_CAP), query)
                    .map(queryExampleConverter::parse));
    }

    /** The one sink every kind shares — the highlight consumes the SAME tsquery as the match. */
    private Mono<String> highlightDocument(final String document, final String query) {
        return dataEntityRepository.getHighlightedResult(document, query);
    }
}
