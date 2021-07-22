package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.DataQualityTestRelationsPojo;
import com.provectus.oddplatform.model.tables.pojos.LineagePojo;

import java.util.Collection;
import java.util.List;

public interface DataQualityTestRelationRepository {
    void createRelations(final Collection<DataQualityTestRelationsPojo> pojos);
}
