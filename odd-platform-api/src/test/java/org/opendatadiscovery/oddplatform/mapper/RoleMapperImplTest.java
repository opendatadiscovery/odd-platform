package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleList;
import org.opendatadiscovery.oddplatform.utils.Page;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Pure-logic unit test for the hand-written RoleMapper.mapToRoleList pagination wrapping — validates
 * F-006 (Role-Based Access Control): the page total and hasNext flag are propagated into the response
 * PageInfo and the items list reflects the page data (empty page → empty items). Exercised against the
 * real generated RoleMapperImpl (no mocks). No prior RoleMapper unit test.
 *
 * @validates F-006
 */
class RoleMapperImplTest {

    private RoleMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new RoleMapperImpl();
    }

    @Test
    void mapToRoleList_emptyPage_propagatesPageInfoWithEmptyItems() {
        final RoleList result = mapper.mapToRoleList(new Page<>(List.of(), 5L, true));
        assertThat(result.getPageInfo().getTotal()).isEqualTo(5L);
        assertThat(result.getPageInfo().getHasNext()).isTrue();
        assertThat(result.getItems()).isEmpty();
    }
}
