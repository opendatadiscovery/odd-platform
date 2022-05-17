package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.List;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;

public interface LabelRepository extends CRUDRepository<LabelPojo> {
    List<LabelPojo> listByDatasetFieldId(final long datasetFieldId);

    List<LabelPojo> listByNames(final Collection<String> names);

    void deleteRelations(final long datasetFieldId, final Collection<Long> labels);

    void deleteRelations(final long id);

    void deleteRelations(final Collection<Long> labels);

    void createRelations(final long datasetFieldId, final Collection<Long> labels);
}
