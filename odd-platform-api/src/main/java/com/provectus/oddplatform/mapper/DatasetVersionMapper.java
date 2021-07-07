package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.api.contract.model.DataSetStructure;
import com.provectus.oddplatform.api.contract.model.DataSetVersion;
import com.provectus.oddplatform.dto.DatasetStructureDto;
import com.provectus.oddplatform.model.tables.pojos.DatasetVersionPojo;

import java.util.Collection;
import java.util.List;

public interface DatasetVersionMapper extends ReadOnlyCRUDMapper<DataSetVersion, DatasetVersionPojo> {
    DataSetVersion mapPojo(final DatasetVersionPojo pojo);

    List<DataSetVersion> mapPojo(final Collection<DatasetVersionPojo> pojos);

    DataSetStructure mapDatasetStructure(final DatasetStructureDto datasetStructureDto);
}
