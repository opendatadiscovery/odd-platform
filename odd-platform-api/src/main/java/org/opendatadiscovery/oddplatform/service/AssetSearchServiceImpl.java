package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetList;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetPageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormData;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.AssetRefDto;
import org.opendatadiscovery.oddplatform.dto.AssetSearchCursor;
import org.opendatadiscovery.oddplatform.dto.AssetSearchPageRow;
import org.opendatadiscovery.oddplatform.dto.AssetSearchScope;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.MyDataScopeDto;
import org.opendatadiscovery.oddplatform.dto.MyDataScopeResult;
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

    @Override
    public Mono<AssetList> searchAssets(final AssetSearchFormData formData, final Integer size,
                                        final String cursorToken) {
        final int cappedSize = Math.min(Math.max(size == null ? 1 : size, 1), MAX_PAGE_SIZE);

        final FacetStateDto state =
            FacetStateDto.removeUnselected(facetStateMapper.mapForm(toSearchFormData(formData)));
        final List<String> assetKinds = formData.getAssetKinds() == null ? List.of()
            : formData.getAssetKinds().stream().map(AssetKind::getValue).toList();

        // Resolve the sort ONCE here so the cursor scope, the keyset-vs-offset choice, and the repository ORDER BY
        // all agree; the cursor decodes fail-closed against it (a foreign/malformed cursor → the first page).
        final SearchSortDto sort =
            SearchSortDto.resolveEffective(state.getSort(), StringUtils.isNotBlank(state.getQuery()));
        final AssetSearchCursor cursor = AssetSearchCursor.decode(cursorToken, sort).orElse(null);

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
                        return resolvePage(state, assetKinds, scope, sort, cursor, cappedSize)
                            .map(list -> withTruncation(list, resolved));
                    }))
                .switchIfEmpty(Mono.just(new AssetList(List.of(), new AssetPageInfo(0L, false))));
        }
        return resolvePage(state, assetKinds, null, sort, cursor, cappedSize);
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
                                        final AssetSearchScope scope, final SearchSortDto sort,
                                        final AssetSearchCursor cursor, final int cappedSize) {
        final boolean relevance = sort == SearchSortDto.RELEVANCE;
        final int relevanceOffset = relevance && cursor != null ? cursor.offset() : 0;

        if (relevance && relevanceOffset >= RELEVANCE_MAX_DEPTH) {
            // Depth-cap terminal: an empty page with hasNext=false and no nextCursor (ADR D12). total is still
            // the match count (display only). Never an unbounded scan.
            return assetSearchRepository.count(state, assetKinds, scope)
                .map(total -> new AssetList(List.of(), new AssetPageInfo(total, false)));
        }

        // Fetch one extra row to derive hasNext + the next cursor without a second query.
        final int fetchLimit = cappedSize + 1;
        final var pageFlux = relevance
            ? assetSearchRepository.relevancePage(state, assetKinds, scope, relevanceOffset, fetchLimit)
            : assetSearchRepository.keysetPage(state, assetKinds, scope, cursor, fetchLimit);

        return Mono.zip(pageFlux.collectList(), assetSearchRepository.count(state, assetKinds, scope))
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
    // FacetStateMapper.mapForm is reused verbatim; the extra asset_kinds dimension is read separately above.
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
