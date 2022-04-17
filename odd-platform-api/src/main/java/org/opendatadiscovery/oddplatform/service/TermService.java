package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.TermDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.TermFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRef;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRefList;
import reactor.core.publisher.Mono;

public interface TermService {

    Mono<TermRefList> getTerms(final Integer page, final Integer size, final String query);

    Mono<TermDetails> createTerm(final TermFormData formData);

    Mono<TermDetails> updateTerm(final Long id, final TermFormData formData);

    Mono<TermDetails> getTermDetails(final Long id);

    Mono<Long> delete(final long id);

    Mono<TermRef> linkTermWithDataEntity(final Long termId, final Long dataEntityId);

    Mono<TermRef> removeTermFromDataEntity(final Long termId, final Long dataEntityId);
}
