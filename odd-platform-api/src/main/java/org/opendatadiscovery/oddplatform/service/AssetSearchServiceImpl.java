package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetList;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormData;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.mapper.FacetStateMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveAssetSearchRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

/**
 * The stateless unified cross-kind search (CTRIB-056 / #1838 ST-4, ADR D2/D9). Mirrors
 * {@link FavoriteServiceImpl#getFavoritesList}: clamp the page window, run the ranked page + count in parallel,
 * then resolve the ranked refs into renderable {@link AssetList} items via {@link SearchAssetResolver}. The
 * shared {@code SearchFormData} contract (query + filters + sort + my_objects) is honored by reusing
 * {@link FacetStateMapper} exactly as {@code SearchServiceImpl.search} does; the extra {@code asset_kinds}
 * dimension narrows to specific kinds. Additive — {@code /api/search} + the per-kind searches are untouched.
 */
@Service
@RequiredArgsConstructor
public class AssetSearchServiceImpl implements AssetSearchService {
    private static final int MAX_PAGE_SIZE = 100;

    private final ReactiveAssetSearchRepository assetSearchRepository;
    private final SearchAssetResolver searchAssetResolver;
    private final FacetStateMapper facetStateMapper;
    private final AuthIdentityProvider authIdentityProvider;

    @Override
    public Mono<AssetList> searchAssets(final AssetSearchFormData formData, final int page, final int size) {
        final int safePage = Math.max(page, 1);
        final int cappedSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);

        final FacetStateDto state =
            FacetStateDto.removeUnselected(facetStateMapper.mapForm(toSearchFormData(formData)));
        final List<String> assetKinds = formData.getAssetKinds() == null ? List.of()
            : formData.getAssetKinds().stream().map(AssetKind::getValue).toList();

        if (state.isMyObjects()) {
            // Match SearchServiceImpl.getSearchResults: my_objects scopes DE rows to the caller's owned set;
            // when no owner resolves (e.g. auth disabled) the whole result is empty, never a full-catalog page.
            return authIdentityProvider.fetchAssociatedOwner()
                .flatMap(owner -> resolvePage(state, assetKinds, owner, safePage, cappedSize))
                .switchIfEmpty(Mono.just(new AssetList(List.of(), new PageInfo(0L, false))));
        }
        return resolvePage(state, assetKinds, null, safePage, cappedSize);
    }

    private Mono<AssetList> resolvePage(final FacetStateDto state, final List<String> assetKinds,
                                        final OwnerPojo owner, final int safePage, final int cappedSize) {
        return Mono.zip(
                assetSearchRepository.rankedPage(state, assetKinds, owner,
                    (safePage - 1) * cappedSize, cappedSize).collectList(),
                assetSearchRepository.count(state, assetKinds, owner))
            .flatMap(pageAndCount -> searchAssetResolver.resolve(pageAndCount.getT1())
                .map(items -> new AssetList()
                    .items(items)
                    .pageInfo(new PageInfo()
                        .total(pageAndCount.getT2())
                        .hasNext((long) safePage * cappedSize < pageAndCount.getT2()))));
    }

    // AssetSearchFormData is a flat allOf-generated DTO (it does NOT extend SearchFormData) but carries the exact
    // SearchFormData shape (query + my_objects + sort + the same SearchFormDataFilters). Adapt it so the shared
    // FacetStateMapper.mapForm is reused verbatim; the extra asset_kinds dimension is read separately above.
    private static SearchFormData toSearchFormData(final AssetSearchFormData formData) {
        return new SearchFormData(formData.getFilters())
            .query(formData.getQuery())
            .myObjects(formData.getMyObjects())
            .sort(formData.getSort());
    }
}
