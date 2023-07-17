package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.dto.term.TermBaseInfoDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityDescriptionUnhandledTermPojo;
import reactor.core.publisher.Flux;

public interface DataEntityDescriptionUnhandledTermRepository {
    Flux<DataEntityDescriptionUnhandledTermPojo> createUnhandledTerms(
        final List<DataEntityDescriptionUnhandledTermPojo> unhandledTerms);

    Flux<DataEntityDescriptionUnhandledTermPojo> deleteUnhandledTerm(final TermBaseInfoDto dto);
}
