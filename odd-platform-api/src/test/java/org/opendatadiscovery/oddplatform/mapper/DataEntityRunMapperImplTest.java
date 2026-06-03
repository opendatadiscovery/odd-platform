package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunList;
import org.opendatadiscovery.oddplatform.utils.Page;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Pure-logic unit test for the hand-written DataEntityRunMapper.mapDataEntityRuns pagination wrapping —
 * validates F-040 (DQ Test Run History): the page total and hasNext flag are propagated into the response
 * PageInfo and an empty run page yields empty items. Exercised against the real generated
 * DataEntityRunMapperImpl (no mocks). No prior DataEntityRunMapper unit test.
 *
 * @validates F-040
 */
class DataEntityRunMapperImplTest {

    private DataEntityRunMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new DataEntityRunMapperImpl(new DateTimeMapperImpl());
    }

    @Test
    void mapDataEntityRuns_emptyPage_propagatesPageInfoWithEmptyItems() {
        final DataEntityRunList result = mapper.mapDataEntityRuns(1L, new Page<>(List.of(), 3L, false));
        assertThat(result.getPageInfo().getTotal()).isEqualTo(3L);
        assertThat(result.getPageInfo().getHasNext()).isFalse();
        assertThat(result.getItems()).isEmpty();
    }
}
