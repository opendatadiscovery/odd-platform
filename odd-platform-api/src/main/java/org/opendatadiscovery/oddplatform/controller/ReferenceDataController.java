package org.opendatadiscovery.oddplatform.controller;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.api.contract.api.ReferenceDataApi;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTable;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFieldFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableList;
import org.opendatadiscovery.oddplatform.api.contract.model.ReferenceDataSearchFacetsData;
import org.opendatadiscovery.oddplatform.api.contract.model.ReferenceDataSearchFormData;
import org.opendatadiscovery.oddplatform.service.LookupDataSearchService;
import org.opendatadiscovery.oddplatform.service.ReferenceDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@Slf4j
@RequiredArgsConstructor
public class ReferenceDataController implements ReferenceDataApi {
    private final ReferenceDataService referenceDataService;
    private final LookupDataSearchService lookupDataSearchService;

    @Override
    public Mono<ResponseEntity<LookupTable>> createReferenceTable(
        final Mono<LookupTableFormData> referenceTableFormData,
        final ServerWebExchange exchange) {
        return referenceTableFormData.flatMap(referenceDataService::createLookupTable)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<LookupTable>>
        createColumnsForLookupTable(final Long lookupTableId,
                                final Flux<LookupTableFieldFormData> lookupTableFieldFormData,
                                final ServerWebExchange exchange) {
        return lookupTableFieldFormData
            .collectList()
            .flatMap(item -> referenceDataService.addColumnsToLookupTable(lookupTableId, item))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<ReferenceDataSearchFacetsData>>
        getReferenceDataSearchFacetList(final UUID searchId,
                                    final ServerWebExchange exchange) {
        return lookupDataSearchService.getFacets(searchId)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<LookupTableList>> getReferenceDataSearchResults(final UUID searchId,
                                                                               final Integer page,
                                                                               final Integer size,
                                                                               final ServerWebExchange exchange) {
        return lookupDataSearchService.getSearchResults(searchId, page, size)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<ReferenceDataSearchFacetsData>> referenceDataSearch(
        final Mono<ReferenceDataSearchFormData> referenceDataSearchFormData, final ServerWebExchange exchange) {
        return referenceDataSearchFormData
            .flatMap(lookupDataSearchService::search)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<ReferenceDataSearchFacetsData>>
        updateReferenceDataSearchFacetList(final UUID searchId,
                                       final Mono<ReferenceDataSearchFormData> referenceDataSearchFormData,
                                       final ServerWebExchange exchange) {
        return referenceDataSearchFormData
            .flatMap(fd -> lookupDataSearchService.updateFacets(searchId, fd))
            .map(ResponseEntity::ok);
    }
}
