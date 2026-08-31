package org.opendatadiscovery.oddplatform.dto;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * The wire-token parse contract for the My-data scope (CTRIB-062 / #1842 ST-8).
 *
 * <p>This is the degradation the published API description PROMISES: {@code my_data} is deliberately a plain
 * string array rather than a strict enum so that "an unrecognised token degrades gracefully (it is dropped)
 * instead of failing the request, so a hand-edited or stale shareable URL can never 400". A promise in a
 * published description with no test behind it is a claim, not a contract — these are the tests that make it
 * one.
 *
 * <p>Pure unit test: {@code parse} touches no collaborator, so it needs no container.
 */
@DisplayName("My-data scope token parsing (CTRIB-062 / #1842 ST-8)")
class MyDataScopeDtoTest {

    @Test
    @DisplayName("blank, whitespace-only and null tokens are DROPPED, not rejected and not parsed")
    void parse_dropsBlankAndNullTokens() {
        final List<String> tokens = new ArrayList<>(Arrays.asList("MY_OBJECTS", "", "   ", null, "UPSTREAM"));

        assertThat(MyDataScopeDto.parse(tokens))
            .as("a URL like ?my_data[]=MY_OBJECTS&my_data[]=&my_data[]=UPSTREAM must resolve to the two real "
                + "scopes — a stray empty token is what a hand-edited or double-encoded URL actually produces")
            .containsExactly(MyDataScopeDto.MY_OBJECTS, MyDataScopeDto.UPSTREAM);
    }

    @Test
    @DisplayName("an unrecognised token is dropped — a stale shareable URL degrades, it never 400s")
    void parse_dropsUnrecognisedTokens() {
        assertThat(MyDataScopeDto.parse(List.of("UPSTREAM", "SIDEWAYS", "MY_TEAMS_OBJECTS")))
            .as("the published description's central promise: unknown tokens degrade to nothing")
            .containsExactly(MyDataScopeDto.UPSTREAM);
    }

    @Test
    @DisplayName("parsing is case-insensitive, order-preserving, and collapses duplicates")
    void parse_normalisesCaseOrderAndDuplicates() {
        assertThat(MyDataScopeDto.parse(List.of("downstream", "  UpStReAm  ", "DOWNSTREAM")))
            .as("case-insensitive with surrounding whitespace trimmed, first-seen order kept, dupes collapsed")
            .containsExactly(MyDataScopeDto.DOWNSTREAM, MyDataScopeDto.UPSTREAM);
    }

    @Test
    @DisplayName("null / empty input means NO narrowing — never 'everything is selected'")
    void parse_nullOrEmptyMeansNoScope() {
        assertThat(MyDataScopeDto.parse(null)).isEmpty();
        assertThat(MyDataScopeDto.parse(List.of())).isEmpty();
        assertThat(MyDataScopeDto.parse(List.of("", "  ")))
            .as("a list of only junk is the All state, not a scope that matches everything")
            .isEmpty();
    }

    @Test
    @DisplayName("MY_OBJECTS walks no lineage; UPSTREAM/DOWNSTREAM carry their stream kind")
    void streamKind_isEmptyOnlyForMyObjects() {
        assertThat(MyDataScopeDto.MY_OBJECTS.streamKind())
            .as("MY_OBJECTS is an ownership scope, not a traversal — an empty stream kind is what stops the "
                + "resolver doing lineage work for it at all")
            .isEmpty();
        assertThat(MyDataScopeDto.UPSTREAM.streamKind()).contains(LineageStreamKind.UPSTREAM);
        assertThat(MyDataScopeDto.DOWNSTREAM.streamKind()).contains(LineageStreamKind.DOWNSTREAM);
    }

    @Test
    @DisplayName("the legacy my_objects alias applies only when my_data is absent (ADR D9)")
    void resolve_legacyAliasOnlyWhenMyDataAbsent() {
        assertThat(MyDataScopeDto.resolve(null, Boolean.TRUE))
            .as("a bookmarked ?my=true keeps working")
            .containsExactly(MyDataScopeDto.MY_OBJECTS);
        assertThat(MyDataScopeDto.resolve(List.of("UPSTREAM"), Boolean.TRUE))
            .as("when my_data is present it WINS outright and the legacy flag is ignored")
            .containsExactly(MyDataScopeDto.UPSTREAM);
        assertThat(MyDataScopeDto.resolve(List.of("NONSENSE"), Boolean.TRUE))
            .as("my_data present but fully unrecognised falls back to the legacy flag rather than 400-ing")
            .containsExactly(MyDataScopeDto.MY_OBJECTS);
        assertThat(MyDataScopeDto.resolve(null, null)).isEmpty();
    }
}
