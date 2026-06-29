package org.opendatadiscovery.oddplatform.service;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleRef;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRef;
import org.opendatadiscovery.oddplatform.dto.AssetRefDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.mapper.DataEntityMapper;
import org.opendatadiscovery.oddplatform.mapper.QueryExampleMapper;
import org.opendatadiscovery.oddplatform.mapper.TermMapper;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Resolves polymorphic catalog-asset references {@code (asset_kind, asset_id)} into renderable per-kind refs,
 * inheriting each kind's canonical visibility — a deleted/hollow asset simply resolves to nothing (issue
 * #1815 / ADR D3 "no title denormalization", D4 "order-then-semi-join"). Composes each kind's existing
 * resolver + ref mapper rather than re-querying or caching titles.
 *
 * <p>Shared by the personal, ownership-free navigation surfaces: Favorites ({@link FavoriteAssetResolver})
 * and Recently-Viewed ({@link RecentlyViewedAssetResolver}). Each adapter calls {@link #resolveByKey} once
 * for its page and then preserves its own ordering and attaches its own per-row metadata.
 */
@Component
@RequiredArgsConstructor
public class AssetRefResolver {
    private final ReactiveDataEntityRepository dataEntityRepository;
    private final DataEntityMapper dataEntityMapper;
    private final ReactiveTermRepository termRepository;
    private final TermMapper termMapper;
    private final ReactiveQueryExampleRepository queryExampleRepository;
    private final QueryExampleMapper queryExampleMapper;

    /**
     * One resolved asset — exactly one of the per-kind refs is populated, selected by {@link #assetKind()}.
     */
    public record ResolvedAsset(AssetKind assetKind, DataEntityRef dataEntity, TermRef term,
                                QueryExampleRef queryExample) {
    }

    /**
     * Resolves the given references into a map keyed by {@link #key(String, Long)}. Assets that are not
     * visible (deleted/hollow data entities, soft-deleted query examples) are absent from the map, so the
     * caller's semi-join drops them. Callers preserve their own ordering by iterating their source page and
     * looking each entry up by key.
     */
    public Mono<Map<String, ResolvedAsset>> resolveByKey(final Collection<AssetRefDto> refs) {
        if (refs.isEmpty()) {
            return Mono.just(Map.of());
        }
        return Mono.zip(
                resolveDataEntities(idsForKind(refs, AssetKind.DATA_ENTITY)),
                resolveTerms(idsForKind(refs, AssetKind.TERM)),
                resolveQueryExamples(idsForKind(refs, AssetKind.QUERY_EXAMPLE)))
            .map(resolvedByKind -> {
                final Map<String, ResolvedAsset> resolved = new HashMap<>();
                resolved.putAll(resolvedByKind.getT1());
                resolved.putAll(resolvedByKind.getT2());
                resolved.putAll(resolvedByKind.getT3());
                return resolved;
            });
    }

    public static String key(final String assetKind, final Long assetId) {
        return assetKind + ":" + assetId;
    }

    private Mono<Map<String, ResolvedAsset>> resolveDataEntities(final Set<Long> ids) {
        if (ids.isEmpty()) {
            return Mono.just(Map.of());
        }
        return dataEntityRepository.getDimensionsByIds(ids)
            .map(dtos -> dtos.stream()
                .filter(this::isVisible)
                .collect(Collectors.toMap(
                    dto -> key(AssetKind.DATA_ENTITY.getValue(), dto.getDataEntity().getId()),
                    dto -> new ResolvedAsset(AssetKind.DATA_ENTITY, dataEntityMapper.mapRef(dto), null, null),
                    (existing, ignored) -> existing)));
    }

    private Mono<Map<String, ResolvedAsset>> resolveTerms(final Set<Long> ids) {
        if (ids.isEmpty()) {
            return Mono.just(Map.of());
        }
        return Flux.fromIterable(ids)
            .flatMap(termRepository::getTermRefDto)
            .collectMap(
                dto -> key(AssetKind.TERM.getValue(), dto.getTerm().getId()),
                dto -> new ResolvedAsset(AssetKind.TERM, null, termMapper.mapToRef(dto), null));
    }

    private Mono<Map<String, ResolvedAsset>> resolveQueryExamples(final Set<Long> ids) {
        if (ids.isEmpty()) {
            return Mono.just(Map.of());
        }
        return Flux.fromIterable(ids)
            .flatMap(queryExampleRepository::get)
            .filter(pojo -> pojo.getDeletedAt() == null)
            .collectMap(
                pojo -> key(AssetKind.QUERY_EXAMPLE.getValue(), pojo.getId()),
                pojo -> new ResolvedAsset(AssetKind.QUERY_EXAMPLE, null, null,
                    queryExampleMapper.mapToQueryExampleRef(pojo)));
    }

    private boolean isVisible(final DataEntityDimensionsDto dto) {
        final var dataEntity = dto.getDataEntity();
        return dataEntity.getStatus() != null
            && dataEntity.getStatus().intValue() != DataEntityStatusDto.DELETED.getId()
            && !Boolean.TRUE.equals(dataEntity.getHollow());
    }

    private static Set<Long> idsForKind(final Collection<AssetRefDto> refs, final AssetKind kind) {
        return refs.stream()
            .filter(ref -> kind.getValue().equals(ref.assetKind()))
            .map(AssetRefDto::assetId)
            .collect(Collectors.toSet());
    }
}
