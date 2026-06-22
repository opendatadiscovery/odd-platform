package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldList;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldTermsDto;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

/**
 * Unit coverage for #1754 Defect 4 (CTRIB-028): the term linked-columns page_info must report the REAL
 * total + a correct hasNext, not the returned page size with hasNext hardcoded false. The boundary math
 * is the new behaviour (pre-fix: new PageInfo(dataFieldsDto.size(), false)). The end-to-end RED→GREEN
 * proof on the running system is integration IT-139.
 */
class DatasetFieldListMapperImplTest {
    // mapPojo (per-row mapping) is not exercised by these page_info-math cases, so the row mappers are mocks.
    private final DatasetFieldListMapper mapper =
        new DatasetFieldListMapperImpl(mock(DataSourceMapper.class), mock(OwnershipMapper.class));

    @Test
    @DisplayName("page_info reports the real total + hasNext=true on an intermediate page")
    void pageInfoReportsRealTotalAndHasNextOnIntermediatePage() {
        // 60 linked columns, page 1 of size 50 -> there ARE more pages
        final DatasetFieldList result = mapper.mapPojos(List.<DatasetFieldTermsDto>of(), 60L, 1, 50);

        assertThat(result.getPageInfo().getTotal()).isEqualTo(60L);
        assertThat(result.getPageInfo().getHasNext()).isTrue();
    }

    @Test
    @DisplayName("page_info has no next page on the last page")
    void pageInfoHasNoNextOnLastPage() {
        // 60 linked columns, page 2 of size 50 -> last page
        final DatasetFieldList result = mapper.mapPojos(List.<DatasetFieldTermsDto>of(), 60L, 2, 50);

        assertThat(result.getPageInfo().getTotal()).isEqualTo(60L);
        assertThat(result.getPageInfo().getHasNext()).isFalse();
    }

    @Test
    @DisplayName("page_info has no next page when the total fits in one page")
    void pageInfoHasNoNextWhenTotalFitsOnePage() {
        final DatasetFieldList result = mapper.mapPojos(List.<DatasetFieldTermsDto>of(), 10L, 1, 50);

        assertThat(result.getPageInfo().getTotal()).isEqualTo(10L);
        assertThat(result.getPageInfo().getHasNext()).isFalse();
    }
}
