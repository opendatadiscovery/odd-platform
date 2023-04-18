package org.opendatadiscovery.oddplatform.mapper;

import java.util.Map;
import org.apache.commons.lang3.StringUtils;
import org.jooq.JSONB;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldDiffState;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldStat;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldType;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;

@Mapper(config = MapperConfig.class, uses = {LabelMapper.class, MetadataFieldValueMapper.class})
public interface DatasetFieldApiMapper {

    @Mapping(source = "datasetFieldPojo", target = ".")
    @Mapping(source = "datasetFieldPojo.type", target = "type", qualifiedByName = "deserializeType")
    @Mapping(source = "datasetFieldPojo.stats", target = "stats", qualifiedByName = "deserializeStats")
    DataSetField mapDto(final DatasetFieldDto datasetFieldDto);

    @Mapping(target = "id", ignore = true)
    DatasetFieldPojo copyWithoutId(final DatasetFieldPojo pojo);

    @Mapping(source = "pojo.type", target = "type", qualifiedByName = "deserializeType")
    DataSetFieldDiffState mapDiffWithParents(final DatasetFieldPojo pojo,
                                             final Map<String, DatasetFieldPojo> versionPojos);

    @AfterMapping
    default void mapParentId(final DatasetFieldPojo pojo,
                             final Map<String, DatasetFieldPojo> versionPojos,
                             @MappingTarget final DataSetFieldDiffState diffState) {
        if (pojo != null && StringUtils.isNotEmpty(pojo.getParentFieldOddrn())) {
            final DatasetFieldPojo parentField = versionPojos.get(pojo.getParentFieldOddrn());
            if (parentField != null) {
                diffState.setParentFieldId(parentField.getId());
            }
        }
    }

    @Named("deserializeType")
    default DataSetFieldType deserializeType(final JSONB type) {
        return JSONSerDeUtils.deserializeJson(type.data(), DataSetFieldType.class);
    }

    @Named("deserializeStats")
    default DataSetFieldStat deserializeStats(final JSONB stats) {
        return JSONSerDeUtils.deserializeJson(stats.data(), DataSetFieldStat.class);
    }
}
