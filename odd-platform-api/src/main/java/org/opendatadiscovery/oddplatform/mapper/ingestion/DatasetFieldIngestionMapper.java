package org.opendatadiscovery.oddplatform.mapper.ingestion;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.JSONB;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DatasetFieldIngestionDto;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetFieldEnumValue;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetFieldStat;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetFieldType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetadataExtension;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Tag;
import org.opendatadiscovery.oddplatform.mapper.MapperConfig;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;

import static java.util.Collections.emptyList;

@Mapper(config = MapperConfig.class)
public interface DatasetFieldIngestionMapper {
    @Mapping(target = "labels", source = "tags")
    @Mapping(target = "field", source = ".")
    @Mapping(target = "metadata", source = "field.metadata", qualifiedByName = "mapFieldMetadata")
    @Mapping(target = "enumValues", source = "enumValues", qualifiedByName = "prepareEnumValues")
    DatasetFieldIngestionDto mapField(final DataSetField field);

    List<DatasetFieldIngestionDto> mapFields(final List<DataSetField> fields);

    @Mapping(target = "isPrimaryKey", defaultValue = "false")
    @Mapping(target = "isSortKey", defaultValue = "false")
    @Mapping(target = "fieldOrder", expression = "java(0)")
    @Mapping(target = "externalDescription", source = "description")
    DatasetFieldPojo mapFieldToPojo(final DataSetField field);

    default List<String> mapLabels(final List<Tag> labels) {
        if (CollectionUtils.isEmpty(labels)) {
            return emptyList();
        }

        return labels.stream().map(Tag::getName).toList();
    }

    default JSONB mapType(final DataSetFieldType type) {
        return serializeIntoJSONB(type);
    }

    default JSONB mapStat(final DataSetFieldStat stat) {
        return serializeIntoJSONB(stat);
    }

    default JSONB serializeIntoJSONB(final Object object) {
        return JSONB.jsonb(JSONSerDeUtils.serializeJson(object));
    }

    @Named("prepareEnumValues")
    default List<DataSetFieldEnumValue> distinctEnumValues(final List<DataSetFieldEnumValue> values) {
        if (CollectionUtils.isEmpty(values)) {
            return values;
        }

        final Map<String, DataSetFieldEnumValue> directory = new HashMap<>();

        for (final DataSetFieldEnumValue value : values) {
            directory.put(value.getName(), value);
        }

        return new ArrayList<>(directory.values());
    }

    @Named("mapFieldMetadata")
    default Map<String, Object> mapFieldMetadata(final List<MetadataExtension> metadata) {
        if (CollectionUtils.isNotEmpty(metadata)) {
            return metadata.get(0).getMetadata();
        }
        return Map.of();
    }
}
