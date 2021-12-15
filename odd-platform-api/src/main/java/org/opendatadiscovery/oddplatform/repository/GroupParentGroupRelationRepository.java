package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GroupParentGroupRelationsPojo;

public interface GroupParentGroupRelationRepository {
    void createRelations(final Collection<GroupParentGroupRelationsPojo> pojos);
}
