package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.DataQualityTestRelationsPojo;
import java.util.Collection;

public interface DataQualityTestRelationRepository {
    void createRelations(final Collection<DataQualityTestRelationsPojo> pojos);
}
