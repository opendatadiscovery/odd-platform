package org.opendatadiscovery.oddplatform.dto;

import org.opendatadiscovery.oddplatform.dto.security.UserDto;

/**
 * The caller's favorites narrowing for the unified asset search (ST-7 / #1841): WHOSE favorites, and in WHICH
 * direction. A {@code null} scope means no favorites narrowing at all — the absent third state of the optional
 * {@code AssetSearchFormData.favorites} boolean.
 *
 * <p>The identity is the {@code (oidc_username, provider)} tuple resolved from the security context by
 * {@link org.opendatadiscovery.oddplatform.auth.CurrentUserIdentityResolver} — NOT the internal Owner that
 * {@code my_objects} uses, and never a request parameter, so a caller can only ever narrow by their own bucket.
 * Under {@code auth.type=DISABLED} the resolver yields the shared sentinel and every caller reads one
 * instance-wide bucket.
 *
 * <p>Carried as its own parameter rather than on {@link FacetStateDto} because favorites is NOT a facet: it has
 * no server-aggregated counts, no {@code FacetType}, and it rides {@code AssetSearchFormData} (the unified path)
 * rather than the shared {@code SearchFormData} the legacy {@code /api/search} also honours.
 *
 * @param favorited {@code true} = only the caller's starred assets; {@code false} = only the ones they have not starred
 */
public record FavoritesScopeDto(String oidcUsername, String provider, boolean favorited) {
    public static FavoritesScopeDto of(final UserDto identity, final boolean favorited) {
        return new FavoritesScopeDto(identity.username(), identity.provider(), favorited);
    }
}
