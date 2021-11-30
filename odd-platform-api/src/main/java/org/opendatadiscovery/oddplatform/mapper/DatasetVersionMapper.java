package org.opendatadiscovery.oddplatform.mapper;

import java.util.Collection;
import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStructure;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetVersion;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;

public interface DatasetVersionMapper extends ReadOnlyCRUDMapper<DataSetVersion, DatasetVersionPojo> {
    DataSetVersion mapPojo(final DatasetVersionPojo pojo);

    List<DataSetVersion> mapPojo(final Collection<DatasetVersionPojo> pojos);

    DataSetStructure mapDatasetStructure(final DatasetStructureDto datasetStructureDto);
}
