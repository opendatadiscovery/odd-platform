package org.opendatadiscovery.oddplatform.mapper;

import java.util.Collection;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStructure;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetVersion;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;

@Mapper(config = MapperConfig.class, uses = {
    DatasetFieldApiMapper.class,
    DateTimeMapper.class
})
public interface DatasetVersionMapper {

    DataSetVersion mapPojo(final DatasetVersionPojo pojo);

    List<DataSetVersion> mapPojo(final Collection<DatasetVersionPojo> pojos);

    @Mapping(source = "datasetVersion", target = "dataSetVersion")
    @Mapping(source = "datasetFields", target = "fieldList")
    DataSetStructure mapDatasetStructure(final DatasetStructureDto datasetStructureDto);

    DatasetVersionPojo mapDatasetVersion(final String datasetOddrn,
                                         final String versionHash,
                                         final long version);
}
