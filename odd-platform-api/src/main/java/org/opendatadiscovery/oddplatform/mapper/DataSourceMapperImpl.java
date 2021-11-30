package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Component;

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

        final NamespacePojo namespace = StringUtils.isNotEmpty(form.getNamespaceName())
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

        final NamespacePojo namespace = StringUtils.isNotEmpty(form.getNamespaceName())
            ? new NamespacePojo().setName(form.getNamespaceName())
            : null;

        return new DataSourceDto(dataSourcePojo, namespace);
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
