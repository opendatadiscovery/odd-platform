package org.opendatadiscovery.oddplatform.mapper;

import org.jooq.JSONB;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldStat;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldType;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;

@Mapper(config = MapperConfig.class, uses = LabelMapper.class)
public interface DatasetFieldApiMapper {

    @Mapping(source = "datasetFieldPojo", target = ".")
    @Mapping(source = "datasetFieldPojo.type", target = "type", qualifiedByName = "deserializeType")
    @Mapping(source = "datasetFieldPojo.stats", target = "stats", qualifiedByName = "deserializeStats")
    DataSetField mapDto(final DatasetFieldDto datasetFieldDto);

    DatasetFieldPojo copy(final DatasetFieldPojo pojo);

    @Named("deserializeType")
    default DataSetFieldType deserializeType(final JSONB type) {
        return JSONSerDeUtils.deserializeJson(type.data(), DataSetFieldType.class);
    }

    @Named("deserializeStats")
    default DataSetFieldStat deserializeStats(final JSONB stats) {
        return JSONSerDeUtils.deserializeJson(stats.data(), DataSetFieldStat.class);
    }
}
