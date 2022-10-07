package org.opendatadiscovery.oddplatform.mapper;

import org.mapstruct.Mapper;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.Title;
import org.opendatadiscovery.oddplatform.api.contract.model.TitleList;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TitlePojo;
import org.opendatadiscovery.oddplatform.utils.Page;

@Mapper(config = MapperConfig.class)
public interface TitleMapper {

    Title mapToTitle(final TitlePojo pojo);

    default TitleList mapToTitleList(final Page<TitlePojo> page) {
        return new TitleList()
            .pageInfo(new PageInfo().total(page.getTotal()).hasNext(page.isHasNext()))
            .items(page.getData().stream().map(this::mapToTitle).toList());
    }
}
