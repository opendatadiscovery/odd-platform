package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import java.util.stream.Collectors;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTable;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableList;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.dto.LookupTableDto;
import org.opendatadiscovery.oddplatform.dto.ReferenceTableDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(config = MapperConfig.class,
    uses = {
        DateTimeMapper.class,
        NamespaceMapper.class,
    })
public abstract class LookupTableMapper {
    protected NamespaceMapper namespaceMapper;
    protected DateTimeMapper dateTimeMapper;
    protected LookupTableDefinitionMapper tableDefinitionMapper;

    @Autowired
    public void setNamespaceMapper(final NamespaceMapper namespaceMapper) {
        this.namespaceMapper = namespaceMapper;
    }

    @Autowired
    public void setDateTimeMapper(final DateTimeMapper dateTimeMapper) {
        this.dateTimeMapper = dateTimeMapper;
    }

    @Autowired
    public void setLookupTableDefinitionMapper(final LookupTableDefinitionMapper lookupTableDefinitionMapper) {
        this.tableDefinitionMapper = lookupTableDefinitionMapper;
    }

    @Mapping(source = "data.name", target = "name")
    @Mapping(source = "data.tableName", target = "tableName")
    @Mapping(source = "data.tableDescription", target = "description")
    @Mapping(source = "data.namespacePojo.id", target = "namespaceId")
    @Mapping(target = "id", ignore = true)
    public abstract LookupTablesPojo mapToPojo(final ReferenceTableDto data,
                                               final Long dataEntityId);

    @Mapping(source = "dto.name", target = "name")
    @Mapping(source = "dto.tableName", target = "tableName")
    @Mapping(source = "dto.tableDescription", target = "description")
    @Mapping(source = "dto.namespacePojo.id", target = "namespaceId")
    public abstract LookupTablesPojo applyToPojo(final ReferenceTableDto dto,
                                                 @MappingTarget final LookupTablesPojo pojo);

    public LookupTable mapToLookupTable(final LookupTableDto dto) {
        return new LookupTable()
            .tableId(dto.tablesPojo().getId())
            .datasetId(dto.tablesPojo().getDataEntityId())
            .name(dto.tablesPojo().getName())
            .description(dto.tablesPojo().getDescription())
            .namespace(namespaceMapper.mapPojo(dto.namespacePojo()))
            .fields(tableDefinitionMapper.mapPojosToTablesFields(dto.definitionsPojos()))
            .createdAt(dateTimeMapper.mapUTCDateTime(dto.tablesPojo().getCreatedAt()))
            .updatedAt(dateTimeMapper.mapUTCDateTime(dto.tablesPojo().getUpdatedAt()));
    }

    public List<LookupTable> mapToLookupTableList(
        final List<LookupTableDto> lookupTableDtos) {
        return lookupTableDtos
            .stream()
            .map(this::mapToLookupTable)
            .collect(Collectors.toList());
    }

    public LookupTableList mapPageToLookupTable(final Page<LookupTableDto> dtoPage) {
        return new LookupTableList()
            .items(mapToLookupTableList(dtoPage.getData()))
            .pageInfo(new PageInfo().total(dtoPage.getTotal()).hasNext(dtoPage.isHasNext()));
    }
}
