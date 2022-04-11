package org.opendatadiscovery.oddplatform.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import java.util.List;

@Mapper(config = MapperConfig.class, uses = {NamespaceMapper.class, TokenMapper.class})
public interface DataSourceMapper {
    DataSource mapPojo(final DataSourcePojo dataSource);

    @Mapping(source = "dataSource", target = ".")
    DataSource mapDto(final DataSourceDto dataSource);

    List<DataSource> mapDtos(final List<DataSourceDto> dtos);

    default DataSourceList mapDtoPage(final Page<DataSourceDto> page) {
        return new DataSourceList()
            .items(mapDtos(page.getData()))
            .pageInfo(new PageInfo().total(page.getTotal()).hasNext(page.isHasNext()));
    }

    @Mapping(source = "namespace.id", target = "namespaceId")
    @Mapping(source = "token.id", target = "tokenId")
    @Mapping(source = "form.name", target = "name")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    DataSourcePojo mapForm(final DataSourceFormData form, final NamespacePojo namespace, final TokenPojo token);

    @Mapping(source = "form", target = ".")
    @Mapping(source = "form.name", target = "name")
    @Mapping(source = "namespace.id", target = "namespaceId")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    DataSourcePojo applyForm(@MappingTarget final DataSourcePojo dataSource,
                             final DataSourceUpdateFormData form,
                             final NamespacePojo namespace);
}
