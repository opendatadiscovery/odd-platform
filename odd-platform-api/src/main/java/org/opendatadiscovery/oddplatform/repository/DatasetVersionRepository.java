package org.opendatadiscovery.oddplatform.repository;

import java.util.List;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;

public interface DatasetVersionRepository extends CRUDRepository<DatasetVersionPojo> {
    List<DatasetVersionPojo> getVersions(final String datasetOddrn);
}
