package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.dto.term.TermBaseInfoDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermDefinitionUnhandledTermPojo;
import reactor.core.publisher.Flux;

public interface TermDefinitionUnhandledTermRepository {

    Flux<TermDefinitionUnhandledTermPojo> deleteForTermExceptSpecified(long termId,
                                                                       final List<TermBaseInfoDto> termsToKeep);

    Flux<TermDefinitionUnhandledTermPojo> createUnhandledTerms(
        final List<TermDefinitionUnhandledTermPojo> unhandledTerms);
}
