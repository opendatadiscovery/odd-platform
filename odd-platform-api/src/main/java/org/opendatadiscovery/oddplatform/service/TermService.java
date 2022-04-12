package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.TermDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.TermFormData;
import reactor.core.publisher.Mono;

public interface TermService {

    Mono<TermDetails> createTerm(final TermFormData formData);

    Mono<TermDetails> updateTerm(final Long id, final TermFormData formData);

    Mono<TermDetails> getTermDetails(final Long id);

    Mono<Long> delete(final long id);
}
