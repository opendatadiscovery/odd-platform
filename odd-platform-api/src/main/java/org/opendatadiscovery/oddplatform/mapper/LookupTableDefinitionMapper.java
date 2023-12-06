package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import java.util.stream.Collectors;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableField;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFieldFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFieldType;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesDefinitionsPojo;

@Mapper(config = MapperConfig.class,
    uses = {
        DateTimeMapper.class,
        LookupTableMapper.class,
    },
    imports = LookupTableFieldType.class)
public interface LookupTableDefinitionMapper {

    @Mapping(source = "data.name", target = "columnName")
    @Mapping(source = "data.isUnique", target = "isUnique")
    @Mapping(source = "data.isNullable", target = "isNullable")
    @Mapping(source = "data.defaultValue", target = "defaultValue")
    @Mapping(target = "columnType", expression = "java(data.getFieldType().getValue())")
    LookupTablesDefinitionsPojo mapToPojo(final LookupTableFieldFormData data,
                                                 final Long lookupTableId);

    @Mapping(source = "pojo.id", target = "fieldId")
    @Mapping(source = "pojo.columnName", target = "name")
    @Mapping(target = "fieldType", expression = "java(LookupTableFieldType.valueOf(pojo.getColumnType()))")
    LookupTableField mapPojoToTablesField(final LookupTablesDefinitionsPojo pojo);

    default List<LookupTablesDefinitionsPojo> mapListToPojoList(final List<LookupTableFieldFormData> data,
                                                                final Long lookupTableId) {
        return data.stream()
            .map(item -> mapToPojo(item, lookupTableId))
            .collect(Collectors.toList());
    }

    default List<LookupTableField> mapPojosToTablesFields(final List<LookupTablesDefinitionsPojo> pojos) {
        return pojos.stream()
            .map(this::mapPojoToTablesField)
            .collect(Collectors.toList());
    }
}
