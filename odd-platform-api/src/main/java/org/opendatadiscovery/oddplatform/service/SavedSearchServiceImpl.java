package org.opendatadiscovery.oddplatform.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.JSONB;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.SavedSearch;
import org.opendatadiscovery.oddplatform.api.contract.model.SavedSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SavedSearchList;
import org.opendatadiscovery.oddplatform.auth.CurrentUserIdentityResolver;
import org.opendatadiscovery.oddplatform.dto.PopularityBands;
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
    /** The wire names of the two enum-/type-sensitive fields a stored spec is sanitised on before binding. */
    private static final String ASSET_KINDS_FIELD = "asset_kinds";
    private static final String FAVORITES_FIELD = "favorites";
    private static final String POPULARITY_FIELD = "popularity";
    private static final String RECENTLY_VIEWED_FIELD = "recently_viewed";
    private static final Set<String> KNOWN_ASSET_KINDS = Arrays.stream(AssetKind.values())
        .map(AssetKind::getValue)
        .collect(Collectors.toUnmodifiableSet());

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

    private JSONB serializeSpec(final AssetSearchFormData spec) {
        return JSONB.jsonb(JSONSerDeUtils.serializeJson(spec));
    }

    /**
     * The stored spec is the full {@link AssetSearchFormData} (#1878 / ADR D11 — one canonical spec, two
     * surfaces): rows saved before the widening carry neither {@code asset_kinds} nor {@code favorites} and read
     * back with both {@code null} (= no narrowing), so they reapply exactly as before.
     *
     * <p>Two layers of fail-closed, deliberately different in grain:
     * <ul>
     *   <li><b>Per token</b> — {@code asset_kinds} is an enum list and {@code favorites} a boolean; a stored
     *   token that no longer exists (a renamed / removed {@link AssetKind}) or a value of the wrong type must
     *   cost the saved search that one field, NOT the whole search. So the jsonb is read as a tree and those
     *   two fields are sanitised before binding: unknown kinds are dropped, a non-array {@code asset_kinds} or
     *   a non-boolean {@code favorites} is removed. This is the posture {@code sort} and {@code my_data}
     *   already have (an unknown token degrades gracefully instead of failing the request).</li>
     *   <li><b>Whole document</b> — malformed / unreadable jsonb still degrades to an empty spec (the search
     *   that reapplies it behaves like a fresh browse) and never surfaces as a 500 while listing.</li>
     * </ul>
     */
    private AssetSearchFormData deserializeSpec(final JSONB spec) {
        if (spec == null) {
            return new AssetSearchFormData();
        }
        try {
            // readTree never returns null (empty content is a MissingNode, which is not an object).
            final JsonNode tree = JSONSerDeUtils.readTree(spec.data());
            if (!tree.isObject()) {
                return new AssetSearchFormData();
            }
            sanitiseSpecTree((ObjectNode) tree);
            return JSONSerDeUtils.treeToValue(tree, AssetSearchFormData.class);
        } catch (final Exception e) {
            log.warn("Unreadable saved-search spec; returning an empty spec (fail-closed): {}", e.getMessage());
            return new AssetSearchFormData();
        }
    }

    /**
     * Drop unknown {@code asset_kinds} tokens, a mistyped {@code favorites}, and a malformed or contradictory
     * {@code popularity} range — field-level, never the spec.
     */
    private void sanitiseSpecTree(final ObjectNode spec) {
        final JsonNode kinds = spec.get(ASSET_KINDS_FIELD);
        if (kinds != null && !kinds.isNull()) {
            if (kinds.isArray()) {
                final ArrayNode kept = spec.arrayNode();
                for (final JsonNode kind : kinds) {
                    if (kind.isTextual() && KNOWN_ASSET_KINDS.contains(kind.asText())) {
                        kept.add(kind);
                    } else {
                        log.warn("Saved-search spec carries an unknown asset kind {}; dropping it", kind);
                    }
                }
                spec.set(ASSET_KINDS_FIELD, kept);
            } else {
                log.warn("Saved-search spec carries a non-list asset_kinds ({}); dropping it", kinds.getNodeType());
                spec.remove(ASSET_KINDS_FIELD);
            }
        }
        final JsonNode favorites = spec.get(FAVORITES_FIELD);
        if (favorites != null && !favorites.isNull() && !favorites.isBoolean()) {
            log.warn("Saved-search spec carries a non-boolean favorites ({}); dropping it", favorites.getNodeType());
            spec.remove(FAVORITES_FIELD);
        }
        sanitisePopularity(spec);
        sanitiseRecentlyViewed(spec);
    }

    /**
     * ST-10 (#1844): a stored {@code recently_viewed} scope is read back exactly as the search would apply it.
     *
     * <p>A non-object is dropped whole. A bound that is not a parseable {@code date-time} is dropped field-level —
     * the spec keeps the scope, losing only the unreadable bound. An INVERTED window (after &gt; before) drops BOTH
     * bounds and KEEPS the scope: on a live request such a window answers an empty page, but a saved search must
     * reapply as the search it can still run, and "every asset in my history" is that search. The FE projection
     * mirrors this exact rule, so the two surfaces can never disagree about what a stored inverted window means.
     *
     * <p>Note the deliberate difference from {@link #sanitisePopularity}: a stored {@code popularity: {}} means no
     * range, while a stored {@code recently_viewed: {}} is a REAL scope (any time). Presence is the switch here, and
     * an empty object is therefore left exactly as it is.
     */
    private void sanitiseRecentlyViewed(final ObjectNode spec) {
        final JsonNode scope = spec.get(RECENTLY_VIEWED_FIELD);
        if (scope == null || scope.isNull()) {
            return;
        }
        if (!scope.isObject()) {
            log.warn("Saved-search spec carries a non-object recently_viewed ({}); dropping it", scope.getNodeType());
            spec.remove(RECENTLY_VIEWED_FIELD);
            return;
        }
        final ObjectNode window = (ObjectNode) scope;
        final OffsetDateTime[] bounds = new OffsetDateTime[2];
        final String[] names = {"viewed_after", "viewed_before"};
        for (int i = 0; i < names.length; i++) {
            final JsonNode value = window.get(names[i]);
            if (value == null || value.isNull()) {
                continue;
            }
            try {
                bounds[i] = OffsetDateTime.parse(value.asText());
            } catch (final Exception e) {
                log.warn("Saved-search spec carries an unparseable recently_viewed {} ({}); dropping the bound",
                    names[i], value.getNodeType());
                window.remove(names[i]);
            }
        }
        if (bounds[0] != null && bounds[1] != null && bounds[0].isAfter(bounds[1])) {
            log.warn("Saved-search spec carries an inverted recently_viewed window; dropping both bounds "
                + "(the scope survives as \"any time\")");
            window.remove(names[0]);
            window.remove(names[1]);
        }
    }

    /**
     * ST-9 (#1843): a stored {@code popularity} range is read back exactly as the search would apply it, or not at
     * all. A non-object is dropped; a non-integer bound is dropped field-level; and an INVERTED range (min > max after
     * the same clamp the live request applies) is dropped whole — on a live request such a range answers an empty
     * page, but a saved search must reapply as the search it can still run, so every reader (the UI's reapply, the API
     * list) agrees: no range. A stored `{}` (no bound) is left as is — it already means "no range".
     */
    private void sanitisePopularity(final ObjectNode spec) {
        final JsonNode popularity = spec.get(POPULARITY_FIELD);
        if (popularity == null || popularity.isNull()) {
            return;
        }
        if (!popularity.isObject()) {
            log.warn("Saved-search spec carries a non-object popularity ({}); dropping it", popularity.getNodeType());
            spec.remove(POPULARITY_FIELD);
            return;
        }
        final ObjectNode range = (ObjectNode) popularity;
        for (final String bound : new String[] {"min", "max"}) {
            final JsonNode value = range.get(bound);
            if (value != null && !value.isNull() && !value.isIntegralNumber()) {
                log.warn("Saved-search spec carries a non-integer popularity {} ({}); dropping the bound",
                    bound, value.getNodeType());
                range.remove(bound);
            }
        }
        final JsonNode lo = range.get("min");
        final JsonNode hi = range.get("max");
        if (lo != null && !lo.isNull() && hi != null && !hi.isNull()
            && PopularityBands.clamp(lo.asInt()) > PopularityBands.clamp(hi.asInt())) {
            log.warn("Saved-search spec carries a contradictory popularity range ({} > {}); dropping it",
                lo.asInt(), hi.asInt());
            spec.remove(POPULARITY_FIELD);
        }
    }

    private UniqueConstraintException nameConflict(final String name) {
        return new UniqueConstraintException("A saved search named '%s' already exists".formatted(name));
    }
}
