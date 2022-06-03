package org.opendatadiscovery.oddplatform.mapper;

import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldStat;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldType;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatasetFieldApiMapperImpl implements DatasetFieldApiMapper {

    private final LabelMapper labelMapper;

    @Override
    public DataSetField mapDto(final DatasetFieldDto dto) {
        final DatasetFieldPojo pojo = dto.getDatasetFieldPojo();
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
            .labels(dto.getLabelPojos().stream().map(labelMapper::mapToLabel).collect(Collectors.toList()));
    }
}
