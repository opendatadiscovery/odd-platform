package org.opendatadiscovery.oddplatform.mapper;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldStat;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldType;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStructure;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetVersion;
import org.opendatadiscovery.oddplatform.api.contract.model.Label;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Component;

@Component
public class DatasetVersionMapperImpl implements DatasetVersionMapper {
    @Override
    public DataSetVersion mapPojo(final DatasetVersionPojo pojo) {
        return new DataSetVersion()
            .id(pojo.getId())
            .version(pojo.getVersion().intValue())
            .createdAt(addUTC(pojo.getCreatedAt()));
    }

    @Override
    public List<DataSetVersion> mapPojo(final Collection<DatasetVersionPojo> pojos) {
        return pojos.stream().map(this::mapPojo).collect(Collectors.toList());
    }

    @Override
    public DataSetStructure mapDatasetStructure(final DatasetStructureDto datasetStructureDto) {
        return new DataSetStructure()
            .dataSetVersion(mapPojo(datasetStructureDto.getDatasetVersion()))
            .fieldList(mapDatasetFields(datasetStructureDto.getDatasetFields()));
    }

    private List<DataSetField> mapDatasetFields(final List<DatasetFieldDto> pojos) {
        final Map<String, Long> dsfIdMap = pojos
            .stream()
            .map(DatasetFieldDto::getDatasetFieldPojo)
            .collect(Collectors.toMap(DatasetFieldPojo::getOddrn, DatasetFieldPojo::getId));

        return pojos.stream()
            .map(dto -> mapDatasetField(dto, dsfIdMap.get(dto.getDatasetFieldPojo().getParentFieldOddrn())))
            .collect(Collectors.toList());
    }

    private DataSetField mapDatasetField(final DatasetFieldDto dto, final Long parentId) {
        final DatasetFieldPojo pojo = dto.getDatasetFieldPojo();

        return new DataSetField()
            .id(pojo.getId())
            .parentFieldId(parentId)
            .name(pojo.getName())
            .oddrn(pojo.getOddrn())
            .stats(mapDatasetFieldStats(pojo.getStats().data()))
            .type(mapDatasetFieldType(pojo.getType().data()))
            .isKey(pojo.getIsKey())
            .isValue(pojo.getIsValue())
            .externalDescription(pojo.getExternalDescription())
            .internalDescription(pojo.getInternalDescription())
            .labels(mapLabels(dto.getLabelPojos()));
    }

    private List<Label> mapLabels(final Collection<LabelPojo> pojos) {
        final List<Label> labels =
            pojos.stream().map(this::mapLabel).filter(Objects::nonNull).collect(Collectors.toList());
        return labels.isEmpty() ? null : labels;
    }

    private Label mapLabel(final LabelPojo pojo) {
        if (pojo == null) {
            return null;
        }

        return new Label()
            .id(pojo.getId())
            .name(pojo.getName());
    }

    private DataSetFieldType mapDatasetFieldType(final String data) {
        return JSONSerDeUtils.deserializeJson(data, DataSetFieldType.class);
    }

    private DataSetFieldStat mapDatasetFieldStats(final String data) {
        return JSONSerDeUtils.deserializeJson(data, DataSetFieldStat.class);
    }
}
