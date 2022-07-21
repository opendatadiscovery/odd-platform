package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import org.opendatadiscovery.oddplatform.dto.LabelDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelToDatasetFieldPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveLabelRepository extends ReactiveCRUDRepository<LabelPojo> {
    Mono<LabelDto> getDto(final long id);

    Mono<List<LabelDto>> listDatasetFieldDtos(final Long datasetFieldId);

    Mono<Page<LabelDto>> pageDto(final int page, final int size, final String query);

    Flux<LabelPojo> listByNames(final Collection<String> names);

    Flux<LabelToDatasetFieldPojo> listLabelRelations(final Collection<Long> datasetFieldIds);

    Flux<LabelToDatasetFieldPojo> createRelations(final Collection<LabelToDatasetFieldPojo> pojos);

    Flux<LabelToDatasetFieldPojo> deleteRelations(final Collection<LabelToDatasetFieldPojo> pojos);

    Flux<LabelToDatasetFieldPojo> deleteRelations(final long labelId);
}
