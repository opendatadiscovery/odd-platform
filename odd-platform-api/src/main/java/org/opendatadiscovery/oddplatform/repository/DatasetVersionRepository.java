package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDelta;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;

public interface DatasetVersionRepository extends CRUDRepository<DatasetVersionPojo> {
    Optional<DatasetStructureDto> getDatasetVersion(final long datasetVersionId);

    Optional<DatasetStructureDto> getLatestDatasetVersion(final long datasetId);

    List<DatasetVersionPojo> getVersions(final long datasetId);

    List<DatasetVersionPojo> getVersions(final String datasetOddrn);

    List<DatasetVersionPojo> getLatestVersions(final Collection<Long> datasetIds);

    Map<String, DatasetStructureDelta> getLastStructureDelta(final Collection<Long> datasetIds);
}
