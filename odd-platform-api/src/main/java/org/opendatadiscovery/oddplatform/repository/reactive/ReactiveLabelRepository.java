package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelToDatasetFieldPojo;
import reactor.core.publisher.Flux;

public interface ReactiveLabelRepository extends ReactiveCRUDRepository<LabelPojo> {
    Flux<LabelPojo> listByDatasetFieldId(final long datasetFieldId);

    Flux<LabelPojo> listByNames(final Collection<String> names);

    Flux<LabelToDatasetFieldPojo> deleteRelations(final long datasetFieldId, final Collection<Long> labelIds);

    Flux<LabelToDatasetFieldPojo> deleteRelations(final long labelId);

    Flux<LabelToDatasetFieldPojo> deleteRelations(final Collection<Long> labelIds);

    Flux<LabelToDatasetFieldPojo> createRelations(final long datasetFieldId, final Collection<Long> labelIds);
}
