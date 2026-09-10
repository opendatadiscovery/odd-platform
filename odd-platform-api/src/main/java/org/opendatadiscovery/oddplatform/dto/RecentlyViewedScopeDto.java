package org.opendatadiscovery.oddplatform.dto;

import java.time.LocalDateTime;
import java.util.Optional;
import org.opendatadiscovery.oddplatform.api.contract.model.RecentlyViewedScope;
import org.opendatadiscovery.oddplatform.dto.security.UserDto;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;

/**
 * The caller's recently-viewed narrowing for the unified asset search (ST-10 / #1844, ADR unified-asset-search D3):
 * WHOSE history, and optionally WHEN within it. A {@code null} scope means no recency narrowing at all.
 *
 * <p><b>Presence is the switch — deliberately the opposite of {@link PopularityRangeDto}.</b> An empty wire object
 * ({@code recently_viewed: {}}) yields a scope with both bounds null, which narrows to every asset in the caller's
 * history ("any time"); a popularity range with no bounds, by contrast, means no narrowing at all. The difference is
 * not an inconsistency: a range with no bounds expresses nothing, while a recency scope with no bounds expresses
 * "assets I have opened" — exactly what the home page's Recently Viewed panel deep-links to. Both contracts state it.
 *
 * <p>The identity is the {@code (oidc_username, provider)} tuple resolved from the security context by
 * {@link org.opendatadiscovery.oddplatform.auth.CurrentUserIdentityResolver} — never a request parameter — so a caller
 * can only ever scope by their own history, and a shared or saved search re-resolves to the RECIPIENT's. Under
 * {@code auth.type=DISABLED} the resolver yields the shared sentinel and every caller reads one instance-wide bucket.
 *
 * <p>Bounds arrive as wire {@link java.time.OffsetDateTime} instants and are normalised to UTC {@code LocalDateTime}
 * here by the same {@link DateTimeUtil#mapUTCDateTime(java.time.OffsetDateTime)} the shipped
 * {@code /api/recently-viewed/list} read path uses, so a client's offset can never shift which rows match. They are
 * INCLUSIVE, mirroring {@code ReactiveRecentlyViewedRepositoryImpl.filterConditions}.
 *
 * <p><b>{@code viewed_within} is deliberately NOT read here.</b> The wire object may also carry a DECLARED window
 * — the word the user picked ({@code TODAY}, {@code LAST_7_DAYS}, {@code LAST_30_DAYS}), which is what lets a saved
 * search called "today" mean the day it is reapplied rather than the day it was saved (CTRIB-070). Resolving it
 * needs the reader's calendar, and only the client knows which one that is: resolving it here would make "today"
 * the SERVER's day and hand two readers in different zones different answers to the same word. So the client
 * resolves the token into the bounds below before it queries, this search narrows by instants alone, and a client
 * that sends the token without bounds gets no window — which the contract states in as many words. The token is
 * carried on the shared object only because a saved search stores that object whole (ADR D11).
 *
 * @param viewedAfter  the earliest last-opened instant included (UTC), or {@code null} for no lower bound
 * @param viewedBefore the latest last-opened instant included (UTC), or {@code null} for no upper bound
 */
public record RecentlyViewedScopeDto(String oidcUsername,
                                     String provider,
                                     LocalDateTime viewedAfter,
                                     LocalDateTime viewedBefore) {
    /** The narrowing a wire object asks for, or empty when the request carries none (a {@code null} field). */
    public static Optional<RecentlyViewedScopeDto> of(final UserDto identity, final RecentlyViewedScope wire) {
        if (wire == null) {
            // NOTE: only a null wire object means "no scope". An EMPTY object is a real scope (see the class javadoc)
            // — do not "fix" this into a PopularityRangeDto-style empty-is-absent check.
            return Optional.empty();
        }
        return Optional.of(new RecentlyViewedScopeDto(
            identity.username(),
            identity.provider(),
            DateTimeUtil.mapUTCDateTime(wire.getViewedAfter()),
            DateTimeUtil.mapUTCDateTime(wire.getViewedBefore())));
    }

    /** True when no instant can satisfy the window — the predicate must then match nothing, never everything. */
    public boolean contradictory() {
        return viewedAfter != null && viewedBefore != null && viewedAfter.isAfter(viewedBefore);
    }
}
