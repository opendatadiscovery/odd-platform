package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.api.contract.model.DataSource;
import com.provectus.oddplatform.api.contract.model.DataSourceFormData;
import com.provectus.oddplatform.api.contract.model.DataSourceList;
import com.provectus.oddplatform.api.contract.model.DataSourceUpdateFormData;
import com.provectus.oddplatform.dto.DataSourceDto;
import com.provectus.oddplatform.model.tables.pojos.DataSourcePojo;
import com.provectus.oddplatform.model.tables.pojos.NamespacePojo;
import com.provectus.oddplatform.utils.Page;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class DataSourceMapperImpl implements DataSourceMapper {
    private final NamespaceMapper namespaceMapper;

    @Override
    public DataSourceDto mapForm(final DataSourceFormData form) {
        final DataSourcePojo dataSourcePojo = new DataSourcePojo()
            .setName(form.getName())
            .setOddrn(form.getOddrn())
            .setDescription(form.getDescription())
            .setActive(form.getActive())
            .setConnectionUrl(form.getConnectionUrl())
            .setPullingInterval(form.getPullingInterval());

        final NamespacePojo namespace = StringUtils.hasLength(form.getNamespaceName())
            ? new NamespacePojo().setName(form.getNamespaceName())
            : null;

        return new DataSourceDto(dataSourcePojo, namespace);
    }

    @Override
    public DataSourceDto applyForm(final DataSourceDto pojo, final DataSourceUpdateFormData form) {
        final DataSourcePojo dataSourcePojo = pojo.getDataSource()
            .setName(form.getName())
            .setDescription(form.getDescription())
            .setConnectionUrl(form.getConnectionUrl())
            .setPullingInterval(form.getPullingInterval())
            .setActive(form.getActive());

        return new DataSourceDto(dataSourcePojo, pojo.getNamespace());
    }

    @Override
    public DataSource mapPojo(final DataSourceDto pojo) {
        final DataSourcePojo dataSource = pojo.getDataSource();
        final NamespacePojo namespace = pojo.getNamespace();

        return new DataSource()
            .id(dataSource.getId())
            .name(dataSource.getName())
            .oddrn(dataSource.getOddrn())
            .description(dataSource.getDescription())
            .connectionUrl(dataSource.getConnectionUrl())
            .namespace(namespaceMapper.mapPojo(namespace))
            .pullingInterval(dataSource.getPullingInterval())
            .active(dataSource.getActive());
    }

    @Override
    public DataSourceList mapPojos(final List<DataSourceDto> pojos) {
        return new DataSourceList()
            .items(mapPojoList(pojos))
            .pageInfo(pageInfo(pojos.size()));
    }

    @Override
    public DataSourceList mapPojos(final Page<DataSourceDto> pojos) {
        return new DataSourceList()
            .items(mapPojoList(pojos.getData()))
            .pageInfo(pageInfo(pojos));
    }
}
