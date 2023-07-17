package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.dto.term.TermBaseInfoDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldDescriptionUnhandledTermPojo;
import reactor.core.publisher.Flux;

public interface DatasetFieldDescriptionUnhandledTermRepository {
    Flux<DatasetFieldDescriptionUnhandledTermPojo> createUnhandledTerms(
        final List<DatasetFieldDescriptionUnhandledTermPojo> unhandledTerms);

    Flux<DatasetFieldDescriptionUnhandledTermPojo> deleteUnhandledTerm(final TermBaseInfoDto dto);
}
