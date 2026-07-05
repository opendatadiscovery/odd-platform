package org.opendatadiscovery.oddplatform.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.SavedSearchApi;
import org.opendatadiscovery.oddplatform.api.contract.model.SavedSearch;
import org.opendatadiscovery.oddplatform.api.contract.model.SavedSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SavedSearchList;
import org.opendatadiscovery.oddplatform.service.SavedSearchService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class SavedSearchController implements SavedSearchApi {
    private final SavedSearchService savedSearchService;

    @Override
    public Mono<ResponseEntity<SavedSearch>> createSavedSearch(
        @Valid final Mono<SavedSearchFormData> savedSearchFormData,
        final ServerWebExchange exchange
    ) {
        return savedSearchFormData.flatMap(savedSearchService::create)
            .map(saved -> ResponseEntity.status(HttpStatus.CREATED).body(saved));
    }

    @Override
    public Mono<ResponseEntity<SavedSearchList>> getSavedSearchList(final Integer page,
                                                                    final Integer size,
                                                                    final ServerWebExchange exchange) {
        return savedSearchService.list(page, size).map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<SavedSearch>> updateSavedSearch(
        final Long savedSearchId,
        @Valid final Mono<SavedSearchFormData> savedSearchFormData,
        final ServerWebExchange exchange
    ) {
        return savedSearchFormData
            .flatMap(form -> savedSearchService.update(savedSearchId, form))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteSavedSearch(final Long savedSearchId,
                                                        final ServerWebExchange exchange) {
        return savedSearchService.delete(savedSearchId)
            .thenReturn(ResponseEntity.noContent().build());
    }
}
