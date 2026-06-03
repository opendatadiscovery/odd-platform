package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Pure-logic unit test for the hand-written OwnershipMapper default methods — validates F-019 (Owner
 * Lifecycle Management): an empty/absent ownership collection maps to NULL, not an empty list. This
 * null-on-empty contract matters because the API/JSON shape distinguishes "no ownership section" (null)
 * from "an empty ownership list" — a refactor returning an empty list would silently change the response.
 * Exercised against the real generated OwnershipMapperImpl (no mocks). No prior OwnershipMapper unit test.
 *
 * @validates F-019
 */
class OwnershipMapperImplTest {

    private OwnershipMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new OwnershipMapperImpl(new OwnerMapperImpl(), new TitleMapperImpl());
    }

    @Test
    void mapDtos_emptyList_returnsNull() {
        assertThat(mapper.mapDtos(List.of())).isNull();
    }

    @Test
    void mapTermDtos_emptySet_returnsNull() {
        assertThat(mapper.mapTermDtos(Set.of())).isNull();
    }
}
