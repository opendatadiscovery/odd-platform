package org.opendatadiscovery.oddplatform.repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageDepth;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LineagePojo;

public interface LineageRepository {
    Optional<Long> getTargetsCount(final long dataEntityId);

    List<LineagePojo> getLineageRelations(final Set<String> rootOddrns,
                                          final LineageDepth depth,
                                          final LineageStreamKind streamKind);
}