package org.opendatadiscovery.oddplatform.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetList;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetPageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.PopularityBucket;
import org.opendatadiscovery.oddplatform.api.contract.model.PopularityFacet;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormData;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.auth.CurrentUserIdentityResolver;
import org.opendatadiscovery.oddplatform.dto.AssetRefDto;
import org.opendatadiscovery.oddplatform.dto.AssetSearchCursor;
import org.opendatadiscovery.oddplatform.dto.AssetSearchPageRow;
import org.opendatadiscovery.oddplatform.dto.AssetSearchScope;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.FavoritesScopeDto;
import org.opendatadiscovery.oddplatform.dto.MyDataScopeDto;
import org.opendatadiscovery.oddplatform.dto.MyDataScopeResult;
import org.opendatadiscovery.oddplatform.dto.PopularityBands;
import org.opendatadiscovery.oddplatform.dto.PopularityRangeDto;
import org.opendatadiscovery.oddplatform.dto.SearchSortDto;
import org.opendatadiscovery.oddplatform.mapper.FacetStateMapper;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveAssetSearchRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

/**
 * The stateless unified cross-kind search (CTRIB-056 / #1838 ST-4, ADR D2/D9; keyset pagination ST-5b / #1839,
 * ADR D12 + ADR-0021). Clamp the page window, run the page + count in parallel, then resolve the ranked refs into
 * renderable {@link AssetList} items via {@link SearchAssetResolver}. The shared {@code SearchFormData} contract
 * (query + filters + sort + my_objects) is honored by reusing {@link FacetStateMapper} exactly as
 * {@code SearchServiceImpl.search} does; the extra {@code asset_kinds} dimension narrows to specific kinds.
 *
 * <p>Pagination is forward-only by opaque cursor: the index-backed browse sorts seek by keyset (deep pages stay
 * index-fast + stable under concurrent writes); the non-seekable relevance sort keeps a bounded offset. The
 * client only echoes {@code page_info.nextCursor}; the keyset-vs-offset split is internal. Additive —
 * {@code /api/search} + the per-kind searches are untouched.
 */
@Service
@RequiredArgsConstructor
public class AssetSearchServiceImpl implements AssetSearchService {
    private static final int MAX_PAGE_SIZE = 100;
    // The global depth ceiling for the non-seekable relevance sort (ADR D12 / SEARCH-CAPABILITIES-DESIGN §2 —
    // "row ~10k → refine your filters"): a request whose offset reaches the cap returns the empty terminal.
    private static final int RELEVANCE_MAX_DEPTH = 10_000;

    private final ReactiveAssetSearchRepository assetSearchRepository;
    private final SearchAssetResolver searchAssetResolver;
    private final FacetStateMapper facetStateMapper;
    private final AuthIdentityProvider authIdentityProvider;
    private final MyDataScopeResolver myDataScopeResolver;
    private final CurrentUserIdentityResolver currentUserIdentityResolver;

    @Override
    public Mono<AssetList> searchAssets(final AssetSearchFormData formData, final Integer size,
                                        final String cursorToken) {
        final int cappedSize = Math.min(Math.max(size == null ? 1 : size, 1), MAX_PAGE_SIZE);

        final FacetStateDto state = facetState(formData);
        final List<String> assetKinds = assetKinds(formData);
        // ST-9 (#1843) — the popularity range, clamped + validated once here; null = no narrowing (also for `{}`).
        final PopularityRangeDto popularity = PopularityRangeDto.of(formData.getPopularity()).orElse(null);

        // Resolve the sort ONCE here so the cursor scope, the keyset-vs-offset choice, and the repository ORDER BY
        // all agree; the cursor decodes fail-closed against it (a foreign/malformed cursor → the first page).
        final SearchSortDto sort =
            SearchSortDto.resolveEffective(state.getSort(), StringUtils.isNotBlank(state.getQuery()));
        final AssetSearchCursor cursor = AssetSearchCursor.decode(cursorToken, sort).orElse(null);

        return scoped(formData, Mono.fromSupplier(() -> new AssetList(List.of(), new AssetPageInfo(0L, false))),
            (scope, favorites, resolved) ->
                resolvePage(state, assetKinds, scope, favorites, popularity, sort, cursor, cappedSize)
                    .map(list -> resolved == null ? list : withTruncation(list, resolved)));
    }

    @Override
    public Mono<PopularityFacet> popularityFacet(final AssetSearchFormData formData) {
        // ST-9 (#1843) — the same scoping as the results (favorites + My-data), the same shared predicates, with
        // the request's OWN popularity range ignored (the repository never sees it here): the bars show what the
        // user can still slide back to. A My-data scope with no resolvable owner yields the all-zero facet, mirroring
        // the empty page the results return on that path.
        final FacetStateDto state = facetState(formData);
        final List<String> assetKinds = assetKinds(formData);
        return scoped(formData, Mono.fromSupplier(() -> toFacet(Map.of())),
            (scope, favorites, resolved) -> assetSearchRepository
                .popularityHistogram(state, assetKinds, scope, favorites)
                .map(this::toFacet));
    }

    /** The shared facet state (the legacy session's model, reused byte-identically — see toSearchFormData). */
    private FacetStateDto facetState(final AssetSearchFormData formData) {
        return FacetStateDto.removeUnselected(facetStateMapper.mapForm(toSearchFormData(formData)));
    }

    private static List<String> assetKinds(final AssetSearchFormData formData) {
        return formData.getAssetKinds() == null ? List.of()
            : formData.getAssetKinds().stream().map(AssetKind::getValue).toList();
    }

    /**
     * A query that runs INSIDE the resolved narrowings: {@code scope} is the My-data scope or {@code null},
     * {@code favorites} the caller's favorites scope or {@code null}, {@code resolved} the My-data resolution (for
     * the truncation stamp) or {@code null} when no My-data scope is selected.
     */
    @FunctionalInterface
    private interface ScopedQuery<T> {
        Mono<T> run(AssetSearchScope scope, FavoritesScopeDto favorites, MyDataScopeResult resolved);
    }

    /**
     * Resolve the two personal narrowings ONCE, then run {@code query} inside them — shared by the results and the
     * popularity facet (ST-9) so the bars can never describe a list the user will not get.
     *
     * <p>ST-7 (#1841) — the favorites narrowing is resolved FIRST and the whole query then runs INSIDE that
     * resolution, rather than beside it: the My-data branch owns an early-return, so a second reactive resolution
     * placed after it would be skipped on that path. Absent `favorites` means no narrowing at all — no identity is
     * resolved and nothing extra is queried. CurrentUserIdentityResolver never completes empty (it falls back to
     * the shared DISABLED sentinel), so unlike the My-data scope this needs no empty short-circuit.
     *
     * <p>These are two INDEPENDENT axes and compose freely: My-data keys on the internal Owner, favorites on the
     * login identity (oidc_username, provider). A user with no Owner association still has favorites.
     *
     * @param noOwnerResult what to answer when a My-data scope is selected but no owner resolves (e.g. auth disabled)
     */
    private <T> Mono<T> scoped(final AssetSearchFormData formData, final Mono<T> noOwnerResult,
                               final ScopedQuery<T> query) {
        if (formData.getFavorites() == null) {
            return myDataScoped(formData, null, noOwnerResult, query);
        }
        return currentUserIdentityResolver.resolve()
            .flatMap(identity -> myDataScoped(formData, FavoritesScopeDto.of(identity, formData.getFavorites()),
                noOwnerResult, query));
    }

    private <T> Mono<T> myDataScoped(final AssetSearchFormData formData, final FavoritesScopeDto favorites,
                                     final Mono<T> noOwnerResult, final ScopedQuery<T> query) {
        // ST-8 (#1842) — the My-data scope group, generalising the my_objects boolean. `my_data` wins when
        // present; otherwise a legacy `my_objects: true` is read as [MY_OBJECTS], so existing saved searches
        // and bookmarked ?my=true URLs keep working unchanged (ADR D9).
        final Set<MyDataScopeDto> scopes =
            MyDataScopeDto.resolve(formData.getMyData(), formData.getMyObjects());

        if (!scopes.isEmpty()) {
            // Match SearchServiceImpl.getSearchResults: a My-data scope narrows to the caller's own world, so
            // when no owner resolves (e.g. auth disabled) the whole result is empty, never a full-catalog page.
            return authIdentityProvider.fetchAssociatedOwner()
                .flatMap(owner -> myDataScopeResolver
                    .resolve(owner.getId(), scopes, depth(formData.getUpstreamDepth()),
                        depth(formData.getDownstreamDepth()))
                    .flatMap(resolved -> {
                        final AssetSearchScope scope = new AssetSearchScope(
                            owner.getId(),
                            scopes.contains(MyDataScopeDto.MY_OBJECTS),
                            scopes.contains(MyDataScopeDto.UPSTREAM) || scopes.contains(MyDataScopeDto.DOWNSTREAM),
                            resolved.neighbourDataEntityIds());
                        return query.run(scope, favorites, resolved);
                    }))
                .switchIfEmpty(noOwnerResult);
        }
        return query.run(null, favorites, null);
    }

    // The 21 fixed buckets (scores 0..20) with their view boundaries, filled from the sparse per-score counts.
    private PopularityFacet toFacet(final Map<Short, Long> counts) {
        final List<PopularityBucket> buckets = new ArrayList<>(PopularityBands.MAX_SCORE + 1);
        for (int score = PopularityBands.MIN_SCORE; score <= PopularityBands.MAX_SCORE; score++) {
            buckets.add(new PopularityBucket()
                .score(score)
                .minViews(PopularityBands.minViews(score))
                .maxViews(PopularityBands.maxViews(score))
                .count(counts.getOrDefault((short) score, 0L)));
        }
        return new PopularityFacet().buckets(buckets);
    }

    // The truncation state is a property of the SCOPE, not of the page, so it is stamped once on the way out
    // rather than threaded through the paging code. A partial impact set that renders as complete is a false
    // governance claim, so this must never be dropped silently.
    private static AssetList withTruncation(final AssetList list, final MyDataScopeResult resolved) {
        if (!resolved.truncated()) {
            return list;
        }
        list.getPageInfo()
            .scopeTruncated(true)
            .scopeTruncationReason(resolved.truncationReason());
        return list;
    }

    // Absent / null depth means the default of 1; anything else is clamped by the resolver, never rejected.
    private static int depth(final Integer requested) {
        return requested == null ? 1 : requested;
    }

    private Mono<AssetList> resolvePage(final FacetStateDto state, final List<String> assetKinds,
                                        final AssetSearchScope scope, final FavoritesScopeDto favorites,
                                        final PopularityRangeDto popularity, final SearchSortDto sort,
                                        final AssetSearchCursor cursor, final int cappedSize) {
        final boolean relevance = sort == SearchSortDto.RELEVANCE;
        final int relevanceOffset = relevance && cursor != null ? cursor.offset() : 0;

        if (relevance && relevanceOffset >= RELEVANCE_MAX_DEPTH) {
            // Depth-cap terminal: an empty page with hasNext=false and no nextCursor (ADR D12). total is still
            // the match count (display only). Never an unbounded scan.
            return assetSearchRepository.count(state, assetKinds, scope, favorites, popularity)
                .map(total -> new AssetList(List.of(), new AssetPageInfo(total, false)));
        }

        // Fetch one extra row to derive hasNext + the next cursor without a second query.
        final int fetchLimit = cappedSize + 1;
        final var pageFlux = relevance
            ? assetSearchRepository.relevancePage(state, assetKinds, scope, favorites, popularity, relevanceOffset,
                fetchLimit)
            : assetSearchRepository.keysetPage(state, assetKinds, scope, favorites, popularity, cursor, fetchLimit);

        return Mono.zip(pageFlux.collectList(),
                assetSearchRepository.count(state, assetKinds, scope, favorites, popularity))
            .flatMap(pageAndCount -> {
                final List<AssetSearchPageRow> rows = pageAndCount.getT1();
                final long total = pageAndCount.getT2();
                final boolean hasNext = rows.size() > cappedSize;
                final List<AssetSearchPageRow> pageRows = hasNext ? rows.subList(0, cappedSize) : rows;
                final String nextCursor = hasNext
                    ? nextCursor(sort, relevance, relevanceOffset, cappedSize, pageRows)
                    : null;
                final List<AssetRefDto> refs = pageRows.stream().map(AssetSearchPageRow::toRef).toList();
                return searchAssetResolver.resolve(refs)
                    .map(items -> new AssetList()
                        .items(items)
                        .pageInfo(new AssetPageInfo().total(total).hasNext(hasNext).nextCursor(nextCursor)));
            });
    }

    // The next page's opaque cursor: the offset reached (relevance) or the last row's keyset position.
    private static String nextCursor(final SearchSortDto sort, final boolean relevance, final int relevanceOffset,
                                     final int cappedSize, final List<AssetSearchPageRow> pageRows) {
        if (relevance) {
            return AssetSearchCursor.relevance(sort, relevanceOffset + cappedSize).encode();
        }
        final AssetSearchPageRow last = pageRows.get(pageRows.size() - 1);
        return AssetSearchCursor.keyset(sort, last.sortValue(), last.sortValueNull(),
            last.assetKind(), last.assetId()).encode();
    }

    // AssetSearchFormData is a flat allOf-generated DTO (it does NOT extend SearchFormData) but carries the exact
    // SearchFormData shape (query + my_objects + sort + the same SearchFormDataFilters). Adapt it so the shared
    // FacetStateMapper.mapForm is reused verbatim; the extra asset_kinds, favorites and popularity dimensions are
    // read separately above (none exists on SearchFormData — they are unified-path-only, ADR D9).
    private static SearchFormData toSearchFormData(final AssetSearchFormData formData) {
        // my_data + the depths are deliberately NOT projected here: FacetStateDto is the LEGACY /api/search
        // session's state, which does not read them (ST-8 keeps that endpoint's behaviour byte-identical —
        // ADR D9). They are read straight off the form data above, exactly as asset_kinds is.
        return new SearchFormData(formData.getFilters())
            .query(formData.getQuery())
            .myObjects(formData.getMyObjects())
            .sort(formData.getSort());
    }
}
