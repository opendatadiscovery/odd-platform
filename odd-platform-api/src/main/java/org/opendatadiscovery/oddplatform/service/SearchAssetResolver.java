package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.Asset;
import org.opendatadiscovery.oddplatform.dto.AssetFieldDto;
import org.opendatadiscovery.oddplatform.dto.AssetRefDto;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * Resolves a ranked page of cross-kind {@code (asset_kind, asset_id)} pairs into renderable {@link Asset}
 * items for the unified search result (CTRIB-056 / #1838 ST-4, ADR D2), preserving the server-side RANK order
 * and inheriting each kind's visibility — a deleted/hollow asset drops out of the resolved map, so the
 * semi-join simply skips it — except that a search whose facet state carries a positive {@code DELETED} status
 * (ST-11 / #1845) has admitted the deleted data entities in its ranked query and its count, and resolves them
 * too. The polymorphic resolution is the same one Favorites + Recently-Viewed use ({@link AssetRefResolver});
 * this adapter only maps the resolved refs into the search contract type and re-imposes the input page's ranking
 * (the ranked query already ordered the refs).
 */
@Component
@RequiredArgsConstructor
public class SearchAssetResolver {
    private final AssetRefResolver assetRefResolver;

    /**
     * Resolves the ranked page into renderable assets plus the result-column values the request named
     * (CTRIB-073 / #1847 ST-13a): each item carries {@code fields} only when {@code fields} is non-empty — an empty
     * set is the pre-ST-13a payload. With {@code includeDeletedDataEntities} (ST-11: the state carries a positive
     * {@code DELETED} status) the page's deleted data entities render too.
     */
    public Mono<List<Asset>> resolve(final List<AssetRefDto> rankedPage, final Set<AssetFieldDto> fields,
                                     final boolean includeDeletedDataEntities) {
        if (rankedPage.isEmpty()) {
            return Mono.just(List.of());
        }
        return assetRefResolver.resolveByKey(rankedPage, fields, includeDeletedDataEntities)
            .map(resolved -> rankedPage.stream()
                .map(ref -> resolved.get(AssetRefResolver.key(ref.assetKind(), ref.assetId())))
                .filter(Objects::nonNull)
                .map(r -> new Asset()
                    .assetKind(r.assetKind())
                    .dataEntity(r.dataEntity())
                    .term(r.term())
                    .queryExample(r.queryExample())
                    .fields(r.fields()))
                .toList());
    }
}
