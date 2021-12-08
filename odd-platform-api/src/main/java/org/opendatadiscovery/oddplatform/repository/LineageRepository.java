package org.opendatadiscovery.oddplatform.repository;

import java.util.List;
import java.util.Optional;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LineagePojo;

public interface LineageRepository {
    void replaceLineagePaths(final List<LineagePojo> pojos);

    Optional<Long> getTargetsCount(final long dataEntityId);
}
