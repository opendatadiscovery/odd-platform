package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.List;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataQualityTestRelationsPojo;

// TODO: there's a reactive one
public interface DataQualityTestRelationRepository {
    // TODO: replace with reactive
    List<DataQualityTestRelationsPojo> getRelations(final Collection<String> dataQATestOddrns);
}
