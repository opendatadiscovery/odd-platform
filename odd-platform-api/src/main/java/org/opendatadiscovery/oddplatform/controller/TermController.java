package org.opendatadiscovery.oddplatform.controller;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.TermApi;
import org.opendatadiscovery.oddplatform.api.contract.model.CountableSearchFilter;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.MultipleFacetType;
import org.opendatadiscovery.oddplatform.api.contract.model.Ownership;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnershipFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnershipUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.Tag;
import org.opendatadiscovery.oddplatform.api.contract.model.TagsFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TermDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.TermFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TermList;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRefList;
import org.opendatadiscovery.oddplatform.api.contract.model.TermSearchFacetsData;
import org.opendatadiscovery.oddplatform.api.contract.model.TermSearchFormData;
import org.opendatadiscovery.oddplatform.service.DataEntityService;
import org.opendatadiscovery.oddplatform.service.term.TermOwnershipService;
import org.opendatadiscovery.oddplatform.service.term.TermSearchService;
import org.opendatadiscovery.oddplatform.service.term.TermService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RestController
@RequiredArgsConstructor
public class TermController implements TermApi {

    private final TermService termService;
    private final DataEntityService dataEntityService;
    private final TermSearchService termSearchService;
    private final TermOwnershipService termOwnershipService;

    @Override
    public Mono<ResponseEntity<TermRefList>> getTermsList(final Integer page, final Integer size,
                                                          final String query,
                                                          final ServerWebExchange exchange) {
        return termService.getTerms(page, size, query)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<TermDetails>> createTerm(final Mono<TermFormData> termFormData,
                                                        final ServerWebExchange exchange) {
        return termFormData
            .flatMap(termService::createTerm)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<TermDetails>> updateTerm(final Long termId, final Mono<TermFormData> termFormData,
                                                        final ServerWebExchange exchange) {
        return termFormData
            .flatMap(formData -> termService.updateTerm(termId, formData))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteTerm(final Long termId,
                                                 final ServerWebExchange exchange) {
        return termService.delete(termId)
            .map(ign -> ResponseEntity.noContent().build());
    }

    @Override
    public Mono<ResponseEntity<TermDetails>> getTermDetails(final Long termId,
                                                            final ServerWebExchange exchange) {
        return termService.getTermDetails(termId)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataEntityList>> getTermLinkedItems(final Long termId, final Integer page,
                                                                   final Integer size,
                                                                   final String query,
                                                                   final Integer entityClassId,
                                                                   final ServerWebExchange exchange) {
        return dataEntityService
            .listByTerm(termId, query, entityClassId, page, size)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Flux<Tag>>> createTermTagsRelations(final Long termId,
                                                                   final Mono<TagsFormData> tagsFormData,
                                                                   final ServerWebExchange exchange) {
        return Mono.just(
            ResponseEntity.ok(tagsFormData.flatMapMany(fd -> termService.upsertTags(termId, fd)))
        );
    }

    @Override
    public Mono<ResponseEntity<Ownership>> createTermOwnership(final Long termId,
                                                               final Mono<OwnershipFormData> ownershipFormData,
                                                               final ServerWebExchange exchange) {
        return ownershipFormData
            .flatMap(form -> termOwnershipService.create(termId, form))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteTermOwnership(final Long termId,
                                                          final Long ownershipId,
                                                          final ServerWebExchange exchange) {
        return termOwnershipService.delete(ownershipId)
            .thenReturn(ResponseEntity.noContent().build());
    }

    @Override
    public Mono<ResponseEntity<Ownership>> updateTermOwnership(final Long termId,
                                                               final Long ownershipId,
                                                               final Mono<OwnershipUpdateFormData> formData,
                                                               final ServerWebExchange exchange) {
        return formData
            .flatMap(form -> termOwnershipService.update(ownershipId, form))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Flux<CountableSearchFilter>>> getTermFiltersForFacet(final UUID searchId,
                                                                                    final MultipleFacetType facetType,
                                                                                    final Integer page,
                                                                                    final Integer size,
                                                                                    final String query,
                                                                                    final ServerWebExchange exchange) {
        return Mono.just(
            ResponseEntity.ok(termSearchService.getFilterOptions(searchId, facetType, page, size, query))
        );
    }

    @Override
    public Mono<ResponseEntity<TermSearchFacetsData>> getTermSearchFacetList(final UUID searchId,
                                                                             final ServerWebExchange exchange) {
        return termSearchService.getFacets(searchId)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<TermList>> getTermSearchResults(final UUID searchId, final Integer page,
                                                               final Integer size,
                                                               final ServerWebExchange exchange) {
        return termSearchService
            .getSearchResults(searchId, page, size)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<TermRefList>> getTermSearchSuggestions(final String query,
                                                                      final ServerWebExchange exchange) {
        return termSearchService.getQuerySuggestions(query)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<TermSearchFacetsData>> termSearch(final Mono<TermSearchFormData> termSearchFormData,
                                                                 final ServerWebExchange exchange) {
        return termSearchFormData
            .flatMap(termSearchService::search)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<TermSearchFacetsData>> updateTermSearchFacets(
        final UUID searchId,
        final Mono<TermSearchFormData> termSearchFormData,
        final ServerWebExchange exchange) {
        return termSearchFormData
            .flatMap(fd -> termSearchService.updateFacets(searchId, fd))
            .map(ResponseEntity::ok);
    }
}
