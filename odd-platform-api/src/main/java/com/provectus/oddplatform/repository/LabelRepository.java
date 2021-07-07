package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.LabelPojo;

import java.util.Collection;
import java.util.List;

public interface LabelRepository extends CRUDRepository<LabelPojo> {
    List<LabelPojo> listByDatasetFieldId(final long datasetFieldId);

    List<LabelPojo> listByNames(final Collection<String> names);

    void deleteRelations(final long datasetFieldId, final Collection<Long> labels);

    void createRelations(final long datasetFieldId, final Collection<Long> labels);
}
