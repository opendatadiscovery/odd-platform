package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.SavedSearch;
import org.opendatadiscovery.oddplatform.api.contract.model.SavedSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SavedSearchList;
import reactor.core.publisher.Mono;

/**
 * Owner-scoped CRUD for saved searches (ST-3 / ADR D11). The owner is always the current security-context
 * identity resolved inside the service — never taken from the request — so every operation is confined to the
 * caller's own saved searches. Names are unique per user; a saved search that is not owned by the caller is
 * reported as not-found (its existence is never leaked).
 */
public interface SavedSearchService {

    Mono<SavedSearch> create(SavedSearchFormData formData);

    Mono<SavedSearchList> list(int page, int size);

    Mono<SavedSearch> update(long id, SavedSearchFormData formData);

    Mono<Void> delete(long id);
}
