package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.LineagePojo;
import java.util.List;
import java.util.Optional;

public interface LineageRepository {
    void createLineagePaths(final List<LineagePojo> pojos);

    Optional<Long> getTargetsCount(final long dataEntityId);
}
