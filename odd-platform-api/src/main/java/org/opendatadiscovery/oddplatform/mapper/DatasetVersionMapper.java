package org.opendatadiscovery.oddplatform.mapper;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStructure;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetVersion;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;

@Mapper(config = MapperConfig.class, uses = {
    DatasetFieldApiMapper.class,
    OffsetDateTimeMapper.class
})
public interface DatasetVersionMapper {

    DataSetVersion mapPojo(final DatasetVersionPojo pojo);

    List<DataSetVersion> mapPojo(final Collection<DatasetVersionPojo> pojos);

    /**
     * This mapping is only required for the parentOddrn mapping.
     * As there is a logic where we gathering map with oddrn and id of the DatasetFieldPojo.
     *
     * @param datasetFieldDtos - list of DatasetFieldDto
     * @param dataSetFields    - list of mapped dataSetFields
     */
    @AfterMapping
    default void mapParentsFields(final List<DatasetFieldDto> datasetFieldDtos,
                                  @MappingTarget List<DataSetField> dataSetFields) {
        final Map<String, Long> dsfIdMap = datasetFieldDtos
            .stream()
            .map(DatasetFieldDto::getDatasetFieldPojo)
            .collect(Collectors.toMap(DatasetFieldPojo::getOddrn, DatasetFieldPojo::getId));
        final List<DatasetFieldPojo> datasetFieldPojos = datasetFieldDtos.stream()
            .map(DatasetFieldDto::getDatasetFieldPojo).toList();
        dataSetFields.forEach(dataSetField -> datasetFieldPojos.forEach(dfPojo -> {
            if (dataSetField.getId().equals(dfPojo.getId())) {
                dataSetField.setParentFieldId(dsfIdMap.get(dfPojo.getParentFieldOddrn()));
            }
        }));
    }

    @Mapping(source = "datasetVersion", target = "dataSetVersion")
    @Mapping(source = "datasetFields", target = "fieldList")
    DataSetStructure mapDatasetStructure(final DatasetStructureDto datasetStructureDto);

    @Mapping(source = "entity.oddrn", target = "datasetOddrn")
    @Mapping(source = "entity.dataSet.structureHash", target = "versionHash")
    DatasetVersionPojo mapDatasetVersion(final EnrichedDataEntityIngestionDto entity, final long version);
}
