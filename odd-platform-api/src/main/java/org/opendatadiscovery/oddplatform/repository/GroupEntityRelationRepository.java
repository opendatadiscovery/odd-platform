package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GroupEntityRelationsPojo;

public interface GroupEntityRelationRepository {
    void createOrUpdateRelations(final Collection<GroupEntityRelationsPojo> pojos);

    Map<String, List<String>> fetchGroupRelations(final Collection<String> childOddrns);

    List<String> getDEGEntitiesOddrns(final long dataEntityGroupId);
}
