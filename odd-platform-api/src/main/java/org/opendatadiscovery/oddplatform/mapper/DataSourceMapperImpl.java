package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSourceMapperImpl implements DataSourceMapper {
    private final NamespaceMapper namespaceMapper;
    private final TokenMapper tokenMapper;

    @Override
    public DataSourceDto mapForm(final DataSourceFormData form) {
        return getDataSourceDto(form, null);
    }

    @Override
    public DataSourceDto mapForm(final DataSourceFormData form, final TokenDto tokenDto) {
        return getDataSourceDto(form, tokenDto);
    }

    @Override
    public DataSourceDto applyForm(final DataSourceDto pojo, final DataSourceUpdateFormData form) {
        final DataSourcePojo dataSourcePojo = pojo.dataSource()
            .setName(form.getName())
            .setDescription(form.getDescription())
            .setConnectionUrl(form.getConnectionUrl())
            .setPullingInterval(form.getPullingInterval())
            .setActive(form.getActive());

        return new DataSourceDto(dataSourcePojo,
            namespaceMapper.createPojoByName(form.getNamespaceName()),
            pojo.token());
    }

    @Override
    public DataSource mapPojo(final DataSourceDto dto) {
        final DataSourcePojo dsPojo = dto.dataSource();

        return new DataSource()
            .id(dsPojo.getId())
            .name(dsPojo.getName())
            .oddrn(dsPojo.getOddrn())
            .description(dsPojo.getDescription())
            .connectionUrl(dsPojo.getConnectionUrl())
            .namespace(namespaceMapper.mapPojo(dto.namespace()))
            .pullingInterval(dsPojo.getPullingInterval())
            .active(dsPojo.getActive())
            .token(tokenMapper.mapDtoToToken(dto.token()));
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

    private DataSourceDto getDataSourceDto(final DataSourceFormData form, final TokenDto tokenDto) {
        final DataSourcePojo dataSourcePojo = new DataSourcePojo()
            .setName(form.getName())
            .setOddrn(form.getOddrn())
            .setDescription(form.getDescription())
            .setActive(form.getActive())
            .setConnectionUrl(form.getConnectionUrl())
            .setPullingInterval(form.getPullingInterval());

        return new DataSourceDto(dataSourcePojo, namespaceMapper.createPojoByName(form.getNamespaceName()), tokenDto);
    }
}
