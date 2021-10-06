package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.dto.DatasetStructureDelta;
import com.provectus.oddplatform.dto.DatasetStructureDto;
import com.provectus.oddplatform.model.tables.pojos.DatasetVersionPojo;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface DatasetVersionRepository extends CRUDRepository<DatasetVersionPojo> {
    Optional<DatasetStructureDto> getDatasetVersion(final long datasetVersionId);

    Optional<DatasetStructureDto> getLatestDatasetVersion(final long datasetId);

    List<DatasetVersionPojo> getVersions(final long datasetId);

    List<DatasetVersionPojo> getLatestVersions(final Collection<Long> datasetIds);

    Map<String, DatasetStructureDelta> getLastStructureDelta(final Collection<Long> datasetIds);
}
