package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.Nullable;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSourceMapperImpl implements DataSourceMapper {
    private final NamespaceMapper namespaceMapper;
    private final TokenMapper tokenMapper;

    @Override
    public DataSourceDto mapForm(final DataSourceFormData form) {
        final DataSourcePojo dataSourcePojo = new DataSourcePojo()
            .setName(form.getName())
            .setOddrn(form.getOddrn())
            .setDescription(form.getDescription())
            .setActive(form.getActive())
            .setConnectionUrl(form.getConnectionUrl())
            .setPullingInterval(form.getPullingInterval());

        return new DataSourceDto(dataSourcePojo, getNamespacePojo(form.getNamespaceName()), null);
    }

    @Override
    public DataSourceDto applyForm(final DataSourceDto pojo, final DataSourceUpdateFormData form) {
        final DataSourcePojo dataSourcePojo = pojo.dataSource()
            .setName(form.getName())
            .setDescription(form.getDescription())
            .setConnectionUrl(form.getConnectionUrl())
            .setPullingInterval(form.getPullingInterval())
            .setActive(form.getActive())
            .setTokenId(form.getToken().getId());

        return new DataSourceDto(dataSourcePojo, getNamespacePojo(form.getNamespaceName()), getTokenPojo(form));
    }

    @Nullable
    private NamespacePojo getNamespacePojo(String namespaceName) {
        return StringUtils.isNotEmpty(namespaceName)
                ? new NamespacePojo().setName(namespaceName)
                : null;
    }

    @Nullable
    private TokenPojo getTokenPojo(DataSourceUpdateFormData form) {
        return ObjectUtils.isNotEmpty(form.getToken())
                ? tokenMapper.mapTokenToPojo(form.getToken())
                : null;
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
            .token(tokenMapper.mapPojoToToken(dto.token()));
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
