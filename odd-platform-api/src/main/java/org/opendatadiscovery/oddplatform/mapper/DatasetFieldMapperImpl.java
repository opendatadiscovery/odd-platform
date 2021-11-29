package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import java.util.stream.Collectors;
import org.jooq.JSONB;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Component;

@Component
public class DatasetFieldMapperImpl implements DatasetFieldMapper {

    @Override
    public DatasetFieldPojo mapField(final DataSetField field) {
        return new DatasetFieldPojo()
            .setName(field.getName())
            .setOddrn(field.getOddrn())
            .setParentFieldOddrn(field.getParentFieldOddrn())
            .setFieldOrder(0)
            .setStats(JSONB.jsonb(JSONSerDeUtils.serializeJson(field.getStats())))
            .setType(JSONB.jsonb(JSONSerDeUtils.serializeJson(field.getType())))
            .setIsKey(field.getIsKey())
            .setIsValue(field.getIsValue())
            .setExternalDescription(field.getDescription());
    }

    @Override
    public List<DatasetFieldPojo> mapFields(final List<DataSetField> fields) {
        return fields.stream().map(this::mapField).collect(Collectors.toList());
    }
}
