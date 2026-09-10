package org.opendatadiscovery.oddplatform.dto;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.api.contract.model.RecentlyViewedScope;
import org.opendatadiscovery.oddplatform.dto.security.UserDto;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * The wire-object -> search-narrowing reading (ST-10 / #1844), and the one thing it deliberately does NOT do
 * (CTRIB-070): resolve a declared window.
 *
 * <p>The declared window ({@code viewed_within}) is the WORD the user picked, and only the client knows which
 * calendar the reader is on — resolving it here would make "today" the server's day. The contract says the search
 * endpoint narrows by the instants alone; this class is where that sentence is kept honest, so it cannot start
 * quietly mattering later without a red test.
 */
class RecentlyViewedScopeDtoTest {
    private static final UserDto ALICE = new UserDto("alice", "google");

    @Test
    @DisplayName("a null wire object is no scope at all; an EMPTY one is a real scope (any time)")
    void presenceIsTheSwitch() {
        assertThat(RecentlyViewedScopeDto.of(ALICE, null)).isEmpty();

        assertThat(RecentlyViewedScopeDto.of(ALICE, new RecentlyViewedScope()))
            .hasValueSatisfying(scope -> {
                assertThat(scope.oidcUsername()).isEqualTo("alice");
                assertThat(scope.provider()).isEqualTo("google");
                assertThat(scope.viewedAfter()).isNull();
                assertThat(scope.viewedBefore()).isNull();
            });
    }

    @Test
    @DisplayName("bounds are normalised to UTC, so a client's offset never shifts which rows match")
    void boundsNormaliseToUtc() {
        final RecentlyViewedScope wire = new RecentlyViewedScope()
            .viewedAfter(OffsetDateTime.of(2026, 9, 1, 3, 0, 0, 0, ZoneOffset.ofHours(3)))
            .viewedBefore(OffsetDateTime.of(2026, 9, 8, 23, 59, 59, 0, ZoneOffset.UTC));

        assertThat(RecentlyViewedScopeDto.of(ALICE, wire)).hasValueSatisfying(scope -> {
            assertThat(scope.viewedAfter()).isEqualTo("2026-09-01T00:00:00");
            assertThat(scope.viewedBefore()).isEqualTo("2026-09-08T23:59:59");
        });
    }

    /**
     * The contract's blunt sentence, pinned: a client that sends only the token gets NO window. It is not an error
     * and not a silent server-side guess at the reader's calendar — it is the scope with both ends open, exactly as
     * an empty object would give, and the client is expected to have resolved the word itself.
     */
    @Test
    @DisplayName("a declared window is NOT resolved here — the search narrows by the instants alone")
    void declaredWindowIsIgnoredByTheSearch() {
        final RecentlyViewedScope wire = new RecentlyViewedScope().viewedWithin("TODAY");

        assertThat(RecentlyViewedScopeDto.of(ALICE, wire)).hasValueSatisfying(scope -> {
            assertThat(scope.viewedAfter())
                .as("no server-side resolve: the server does not know the reader's calendar")
                .isNull();
            assertThat(scope.viewedBefore()).isNull();
            assertThat(scope.contradictory()).isFalse();
        });
    }

    @Test
    @DisplayName("an inverted window is contradictory — the predicate must match nothing, never everything")
    void invertedIsContradictory() {
        final RecentlyViewedScope wire = new RecentlyViewedScope()
            .viewedAfter(OffsetDateTime.of(2026, 9, 8, 0, 0, 0, 0, ZoneOffset.UTC))
            .viewedBefore(OffsetDateTime.of(2026, 9, 1, 0, 0, 0, 0, ZoneOffset.UTC));

        assertThat(RecentlyViewedScopeDto.of(ALICE, wire))
            .hasValueSatisfying(scope -> assertThat(scope.contradictory()).isTrue());
    }
}
