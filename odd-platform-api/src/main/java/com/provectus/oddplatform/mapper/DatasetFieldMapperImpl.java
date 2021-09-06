package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.ingestion.contract.model.DataSetField;
import com.provectus.oddplatform.model.tables.pojos.DatasetFieldPojo;
import com.provectus.oddplatform.utils.JSONSerDeUtils;
import java.util.List;
import java.util.stream.Collectors;
import org.jooq.JSONB;
import org.springframework.stereotype.Component;

@Component
public class DatasetFieldMapperImpl implements DatasetFieldMapper {
    @Override
    public List<DatasetFieldPojo> mapStructure(final List<DataSetField> fields, final long datasetVersionId) {
        return fields.stream().map(f -> mapStructure(f, datasetVersionId)).collect(Collectors.toList());
    }

    @Override
    public DatasetFieldPojo mapStructure(final DataSetField field, final long datasetVersionId) {
        return new DatasetFieldPojo()
                .setDatasetVersionId(datasetVersionId)
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
}
