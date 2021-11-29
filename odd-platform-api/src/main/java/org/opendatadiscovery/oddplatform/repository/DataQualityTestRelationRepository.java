package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataQualityTestRelationsPojo;

public interface DataQualityTestRelationRepository {
    void createRelations(final Collection<DataQualityTestRelationsPojo> pojos);
}
