package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.JSONB;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.SavedSearch;
import org.opendatadiscovery.oddplatform.api.contract.model.SavedSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SavedSearchList;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormData;
import org.opendatadiscovery.oddplatform.auth.CurrentUserIdentityResolver;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.exception.UniqueConstraintException;
import org.opendatadiscovery.oddplatform.mapper.DateTimeMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.SavedSearchPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSavedSearchRepository;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class SavedSearchServiceImpl implements SavedSearchService {
    private static final int MAX_PAGE_SIZE = 100;

    private final CurrentUserIdentityResolver currentUserIdentityResolver;
    private final ReactiveSavedSearchRepository savedSearchRepository;
    private final DateTimeMapper dateTimeMapper;

    @Override
    public Mono<SavedSearch> create(final SavedSearchFormData formData) {
        return currentUserIdentityResolver.resolve()
            .flatMap(user -> savedSearchRepository
                .existsByName(user.username(), user.provider(), formData.getName(), null)
                .flatMap(exists -> Boolean.TRUE.equals(exists)
                    ? Mono.<SavedSearchPojo>error(nameConflict(formData.getName()))
                    : savedSearchRepository.create(user.username(), user.provider(),
                        formData.getName(), serializeSpec(formData.getSpec()))))
            .map(this::toModel);
    }

    @Override
    public Mono<SavedSearchList> list(final int page, final int size) {
        final int safePage = Math.max(page, 1);
        final int cappedSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        return currentUserIdentityResolver.resolve().flatMap(user -> Mono.zip(
                savedSearchRepository.list(user.username(), user.provider(),
                    (safePage - 1) * cappedSize, cappedSize).collectList(),
                savedSearchRepository.count(user.username(), user.provider()))
            .map(pageAndCount -> new SavedSearchList()
                .items(pageAndCount.getT1().stream().map(this::toModel).toList())
                .pageInfo(new PageInfo()
                    .total(pageAndCount.getT2())
                    .hasNext((long) safePage * cappedSize < pageAndCount.getT2()))));
    }

    @Override
    public Mono<SavedSearch> update(final long id, final SavedSearchFormData formData) {
        return currentUserIdentityResolver.resolve()
            .flatMap(user -> savedSearchRepository.get(id, user.username(), user.provider())
                // Not owned / absent → 404 (existence is never leaked), and 404 wins over a name conflict.
                // The uniqueness check + the update are built lazily INSIDE this flatMap, so they never run
                // (nor even assemble) unless the row is actually owned — the not-owned path errors here.
                .switchIfEmpty(Mono.error(new NotFoundException("Saved search", id)))
                .flatMap(existing -> savedSearchRepository
                    .existsByName(user.username(), user.provider(), formData.getName(), id)
                    .flatMap(exists -> Boolean.TRUE.equals(exists)
                        ? Mono.<SavedSearchPojo>error(nameConflict(formData.getName()))
                        : savedSearchRepository.update(id, user.username(), user.provider(),
                            formData.getName(), serializeSpec(formData.getSpec())))))
            .map(this::toModel);
    }

    @Override
    public Mono<Void> delete(final long id) {
        return currentUserIdentityResolver.resolve()
            .flatMap(user -> savedSearchRepository.delete(id, user.username(), user.provider()))
            .defaultIfEmpty(0)
            .flatMap(deleted -> deleted > 0
                ? Mono.empty()
                : Mono.error(new NotFoundException("Saved search", id)));
    }

    private SavedSearch toModel(final SavedSearchPojo pojo) {
        return new SavedSearch()
            .id(pojo.getId())
            .name(pojo.getName())
            .spec(deserializeSpec(pojo.getSpec()))
            .createdAt(dateTimeMapper.mapUTCDateTime(pojo.getCreatedAt()))
            .updatedAt(dateTimeMapper.mapUTCDateTime(pojo.getUpdatedAt()));
    }

    private JSONB serializeSpec(final SearchFormData spec) {
        return JSONB.jsonb(JSONSerDeUtils.serializeJson(spec));
    }

    /**
     * Fail-closed read: a corrupt or unreadable stored spec must never surface as a 500 while listing the
     * user's saved searches — it degrades to an empty spec (the search that reapplies it then behaves like a
     * fresh browse). We only ever write a valid {@link SearchFormData}, so this is a safety net, not a path.
     */
    private SearchFormData deserializeSpec(final JSONB spec) {
        if (spec == null) {
            return new SearchFormData();
        }
        try {
            final SearchFormData parsed = JSONSerDeUtils.deserializeJson(spec.data(), SearchFormData.class);
            return parsed != null ? parsed : new SearchFormData();
        } catch (final RuntimeException e) {
            log.warn("Unreadable saved-search spec; returning an empty spec (fail-closed): {}", e.getMessage());
            return new SearchFormData();
        }
    }

    private UniqueConstraintException nameConflict(final String name) {
        return new UniqueConstraintException("A saved search named '%s' already exists".formatted(name));
    }
}
