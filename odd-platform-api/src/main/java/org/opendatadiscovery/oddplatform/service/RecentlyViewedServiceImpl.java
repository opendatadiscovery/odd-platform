package org.opendatadiscovery.oddplatform.service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetRef;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.RecentlyViewedAssetList;
import org.opendatadiscovery.oddplatform.api.contract.model.RecentlyViewedRef;
import org.opendatadiscovery.oddplatform.auth.CurrentUserIdentityResolver;
import org.opendatadiscovery.oddplatform.dto.AssetRefDto;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveRecentlyViewedRepository;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class RecentlyViewedServiceImpl implements RecentlyViewedService {
    private static final int MAX_PAGE_SIZE = 100;

    private final CurrentUserIdentityResolver currentUserIdentityResolver;
    private final ReactiveRecentlyViewedRepository recentlyViewedRepository;
    private final RecentlyViewedAssetResolver recentlyViewedAssetResolver;

    @Override
    public Mono<Void> recordView(final AssetKind assetKind, final long assetId) {
        return currentUserIdentityResolver.resolve()
            .flatMap(user -> recentlyViewedRepository.recordView(
                user.username(), user.provider(), assetKind.getValue(), assetId));
    }

    @Override
    public Mono<Void> removeRecentlyViewed(final AssetKind assetKind, final long assetId) {
        return currentUserIdentityResolver.resolve()
            .flatMap(user -> recentlyViewedRepository.removeRecentlyViewed(
                user.username(), user.provider(), assetKind.getValue(), assetId));
    }

    @Override
    public Flux<RecentlyViewedRef> getRecentlyViewedStatus(final Flux<AssetRef> assetRefs) {
        return assetRefs.collectList().flatMapMany(refs -> {
            if (refs.isEmpty()) {
                return Flux.empty();
            }
            final List<AssetRefDto> queried = refs.stream()
                .map(ref -> new AssetRefDto(ref.getAssetKind().getValue(), ref.getAssetId()))
                .toList();
            return currentUserIdentityResolver.resolve()
                .flatMapMany(user ->
                    recentlyViewedRepository.getRecentlyViewed(user.username(), user.provider(), queried))
                .map(pojo -> new RecentlyViewedRef()
                    .assetKind(AssetKind.fromValue(pojo.getAssetKind()))
                    .assetId(pojo.getAssetId())
                    .lastViewedAt(DateTimeUtil.mapUTCDateTime(pojo.getLastViewedAt())));
        });
    }

    @Override
    public Mono<RecentlyViewedAssetList> getRecentlyViewedList(final List<AssetKind> assetTypes,
                                                               final OffsetDateTime viewedAfter,
                                                               final OffsetDateTime viewedBefore,
                                                               final int page, final int size) {
        final int safePage = Math.max(page, 1);
        final int cappedSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        final List<String> assetKinds = assetTypes == null ? List.of()
            : assetTypes.stream().map(AssetKind::getValue).toList();
        final LocalDateTime after = DateTimeUtil.mapUTCDateTime(viewedAfter);
        final LocalDateTime before = DateTimeUtil.mapUTCDateTime(viewedBefore);
        return currentUserIdentityResolver.resolve().flatMap(user -> Mono.zip(
                recentlyViewedRepository.getRecentlyViewedPage(user.username(), user.provider(), assetKinds,
                    after, before, (safePage - 1) * cappedSize, cappedSize).collectList(),
                recentlyViewedRepository.countRecentlyViewed(user.username(), user.provider(), assetKinds,
                    after, before))
            .flatMap(pageAndCount -> recentlyViewedAssetResolver.resolve(pageAndCount.getT1())
                .map(items -> new RecentlyViewedAssetList()
                    .items(items)
                    .pageInfo(new PageInfo()
                        .total(pageAndCount.getT2())
                        .hasNext((long) safePage * cappedSize < pageAndCount.getT2())))));
    }
}
