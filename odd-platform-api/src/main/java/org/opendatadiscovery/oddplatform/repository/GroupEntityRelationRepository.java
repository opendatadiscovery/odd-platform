package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.List;
import java.util.Map;

public interface GroupEntityRelationRepository {
    Map<String, List<String>> fetchGroupRelations(final Collection<String> childOddrns);

    List<String> getDEGEntitiesOddrns(final long dataEntityGroupId);
}
