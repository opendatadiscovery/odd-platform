package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldType;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldList;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.TermSearchDataSetField;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldTermsDto;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatasetFieldListMapperImpl implements DatasetFieldListMapper {
    private final DataSourceMapper dataSourceMapper;
    private final OwnershipMapper ownershipMapper;

    @Override
    public DatasetFieldList mapPojos(final List<DatasetFieldTermsDto> dataFieldsDto) {
        final List<TermSearchDataSetField> entities = dataFieldsDto.stream().map(this::mapPojo).toList();
        final PageInfo pageInfo = pageInfo(dataFieldsDto.size());
        return new DatasetFieldList(entities, pageInfo);
    }

    private TermSearchDataSetField mapPojo(final DatasetFieldTermsDto dto) {
        return new TermSearchDataSetField()
            .id(dto.getId())
            .internalName(dto.getInternalName())
            .name(dto.getName())
            .oddrn(dto.getOddrn())
            .defaultValue(dto.getDefaultValue())
            .externalDescription(dto.getExternalDescription())
            .internalDescription(dto.getInternalDescription())
            .isKey(dto.getIsKey())
            .isPrimaryKey(dto.getIsPrimaryKey())
            .isSortKey(dto.getIsSortKey())
            .isValue(dto.getIsValue())
            .type(JSONSerDeUtils.deserializeJson(dto.getType().data(), DataSetFieldType.class))
            .dataEntityId(dto.getDataEntityId())
            .dataEntityName(dto.getDataEntityName())
            .ownership(ownershipMapper.mapDtos(dto.getOwnership()))
            .dataSource(dataSourceMapper.mapDto(new DataSourceDto(dto.getDataSource(), dto.getNamespace(), null)));
    }

    private PageInfo pageInfo(final long total) {
        return new PageInfo(total, false);
    }
}
