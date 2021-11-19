package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.api.contract.model.DataSetField;
import com.provectus.oddplatform.api.contract.model.DataSetFieldStat;
import com.provectus.oddplatform.api.contract.model.DataSetFieldType;
import com.provectus.oddplatform.dto.DatasetFieldDto;
import com.provectus.oddplatform.model.tables.pojos.DatasetFieldPojo;
import com.provectus.oddplatform.utils.JSONSerDeUtils;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatasetFieldApiMapperImpl implements DatasetFieldApiMapper {

    private final LabelMapper labelMapper;

    @Override
    public DataSetField mapDto(final DatasetFieldDto dto) {
        DatasetFieldPojo pojo = dto.getDatasetFieldPojo();
        return new DataSetField()
            .id(pojo.getId())
            .parentFieldId(dto.getParentFieldId())
            .oddrn(pojo.getOddrn())
            .name(pojo.getName())
            .type(JSONSerDeUtils.deserializeJson(pojo.getType().data(), DataSetFieldType.class))
            .stats(JSONSerDeUtils.deserializeJson(pojo.getStats().data(), DataSetFieldStat.class))
            .isKey(pojo.getIsKey())
            .isValue(pojo.getIsValue())
            .externalDescription(pojo.getExternalDescription())
            .internalDescription(pojo.getInternalDescription())
            .labels(dto.getLabelPojos().stream().map(labelMapper::mapPojo).collect(Collectors.toList()));
    }
}
