package org.opendatadiscovery.oddplatform.auth;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.security.UserDto;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * Resolves the current user identity tuple {@code (oidc_username, provider)} for the personal,
 * ownership-free navigation surfaces (Favorites, and later Recently-Viewed).
 *
 * <p>Identity is taken from the security context only — never the internal Owner, never a request
 * parameter — so a user can only ever read or write their own bucket. Under {@code auth.type=DISABLED}
 * there is no principal, so the resolver falls back to a single reserved shared sentinel
 * {@code (__shared__, DISABLED)}; the literal {@code DISABLED} provider can never collide with a real
 * login (no DISABLED login is ever persisted — see {@code V0_0_92}).
 */
@Component
@RequiredArgsConstructor
public class CurrentUserIdentityResolver {
    public static final String SHARED_USERNAME = "__shared__";
    public static final String SHARED_PROVIDER = "DISABLED";

    private final AuthIdentityProvider authIdentityProvider;

    public Mono<UserDto> resolve() {
        return authIdentityProvider.getCurrentUser()
            .switchIfEmpty(Mono.fromSupplier(() -> new UserDto(SHARED_USERNAME, SHARED_PROVIDER)));
    }
}
