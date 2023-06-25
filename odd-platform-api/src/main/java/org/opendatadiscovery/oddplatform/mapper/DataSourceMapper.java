package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import java.util.Map;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceDirectory;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.utils.Page;

@Mapper(
    config = MapperConfig.class,
    uses = {NamespaceMapper.class, TokenMapper.class}
)
public interface DataSourceMapper {
    DataSource mapPojo(final DataSourcePojo dataSource);

    @Mapping(source = "dataSource", target = ".")
    DataSource mapDto(final DataSourceDto dataSource);

    List<DataSource> mapDtos(final List<DataSourceDto> dtos);

    default DataSourceList mapDtoPage(final Page<DataSourceDto> page) {
        final List<DataSource> items = mapDtos(page.getData());
        final PageInfo pageInfo = new PageInfo(page.getTotal(), page.isHasNext());
        return new DataSourceList(items, pageInfo);
    }

    @Mapping(target = "oddrn", expression = "java(form.getOddrn().trim())")
    DataSourcePojo mapForm(final DataSourceFormData form);

    default DataSourcePojo mapForm(final DataSourceFormData form,
                                   final NamespacePojo namespace,
                                   final TokenDto token) {
        return mapForm(form)
            .setNamespaceId(namespace != null ? namespace.getId() : null)
            .setTokenId(token != null ? token.tokenPojo().getId() : null);
    }

    DataSourcePojo applyToPojo(@MappingTarget final DataSourcePojo dataSource, final DataSourceUpdateFormData form);

    default DataSourcePojo applyToPojo(final DataSourcePojo dataSource,
                                       final DataSourceUpdateFormData form,
                                       final NamespacePojo namespace) {
        return applyToPojo(dataSource, form)
            .setNamespaceId(namespace != null ? namespace.getId() : null);
    }

    @Mapping(target = "id", source = "pojo.id")
    @Mapping(target = "name", source = "pojo.name")
    @Mapping(target = "entitiesCount", source = "entitiesCount")
    @Mapping(target = "properties", source = "properties")
    DataSourceDirectory mapToDirectoryDataSource(final DataSourcePojo pojo,
                                                 final Map<String, String> properties,
                                                 final Long entitiesCount);
}
