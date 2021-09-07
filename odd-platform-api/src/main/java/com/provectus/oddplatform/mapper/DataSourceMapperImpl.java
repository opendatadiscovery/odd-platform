package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.api.contract.model.DataSource;
import com.provectus.oddplatform.api.contract.model.DataSourceFormData;
import com.provectus.oddplatform.api.contract.model.DataSourceList;
import com.provectus.oddplatform.api.contract.model.DataSourceUpdateFormData;
import com.provectus.oddplatform.model.tables.pojos.DataSourcePojo;
import com.provectus.oddplatform.utils.Page;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class DataSourceMapperImpl implements DataSourceMapper {
    @Override
    public DataSourcePojo mapForm(final DataSourceFormData form) {
        return new DataSourcePojo()
            .setName(form.getName())
            .setOddrn(form.getOddrn())
            .setDescription(form.getDescription())
            .setActive(form.getActive())
            .setConnectionUrl(form.getConnectionUrl())
            .setPullingInterval(form.getPullingInterval());
    }

    @Override
    public DataSourcePojo applyForm(final DataSourcePojo pojo, final DataSourceUpdateFormData form) {
        return pojo
            .setName(form.getName())
            .setDescription(form.getDescription())
            .setConnectionUrl(form.getConnectionUrl())
            .setPullingInterval(form.getPullingInterval())
            .setActive(form.getActive());
    }

    @Override
    public DataSource mapPojo(final DataSourcePojo pojo) {
        return new DataSource()
            .id(pojo.getId())
            .name(pojo.getName())
            .oddrn(pojo.getOddrn())
            .description(pojo.getDescription())
            .connectionUrl(pojo.getConnectionUrl())
            .pullingInterval(pojo.getPullingInterval())
            .active(pojo.getActive());
    }

    @Override
    public DataSourceList mapPojos(final List<DataSourcePojo> pojos) {
        return new DataSourceList()
            .items(mapPojoList(pojos))
            .pageInfo(pageInfo(pojos.size()));
    }

    @Override
    public DataSourceList mapPojos(final Page<DataSourcePojo> pojos) {
        return new DataSourceList()
            .items(mapPojoList(pojos.getData()))
            .pageInfo(pageInfo(pojos));
    }
}
