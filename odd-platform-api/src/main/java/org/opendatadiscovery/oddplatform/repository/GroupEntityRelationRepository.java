package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GroupEntityRelationsPojo;

public interface GroupEntityRelationRepository {
    void createOrUpdateRelations(final Collection<GroupEntityRelationsPojo> pojos);
}
