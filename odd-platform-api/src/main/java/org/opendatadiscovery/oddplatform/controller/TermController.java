package org.opendatadiscovery.oddplatform.controller;

import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.TermApi;
import org.opendatadiscovery.oddplatform.api.contract.model.CountableSearchFilter;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldList;
import org.opendatadiscovery.oddplatform.api.contract.model.LinkedTerm;
import org.opendatadiscovery.oddplatform.api.contract.model.LinkedTermFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LinkedTermList;
import org.opendatadiscovery.oddplatform.api.contract.model.MultipleFacetType;
import org.opendatadiscovery.oddplatform.api.contract.model.Ownership;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnershipFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnershipUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExample;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleTermFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.Tag;
import org.opendatadiscovery.oddplatform.api.contract.model.TagsFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TermDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.TermFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TermList;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRef;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRefList;
import org.opendatadiscovery.oddplatform.api.contract.model.TermSearchFacetsData;
import org.opendatadiscovery.oddplatform.api.contract.model.TermSearchFormData;
import org.opendatadiscovery.oddplatform.service.DataEntityService;
import org.opendatadiscovery.oddplatform.service.DatasetFieldService;
import org.opendatadiscovery.oddplatform.service.QueryExampleService;
import org.opendatadiscovery.oddplatform.service.term.TermOwnershipService;
import org.opendatadiscovery.oddplatform.service.term.TermSearchService;
import org.opendatadiscovery.oddplatform.service.term.TermService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class TermController implements TermApi {

    private final TermService termService;
    private final DataEntityService dataEntityService;
    private final DatasetFieldService datasetFieldService;
    private final TermSearchService termSearchService;
    private final TermOwnershipService termOwnershipService;
    private final QueryExampleService queryExampleService;

    @Override
    public Mono<ResponseEntity<TermRefList>> getTermsList(final Integer page, final Integer size,
                                                          final String query,
                                                          final OffsetDateTime updatedAtRangeStartDateTime,
                                                          final OffsetDateTime updatedAtRangeEndDateTime,
                                                          final ServerWebExchange exchange) {
        return termService.getTerms(page, size, query, updatedAtRangeStartDateTime, updatedAtRangeEndDateTime)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<TermRef>> getTermByNamespaceAndName(final String namespaceName,
                                                                   final String termName,
                                                                   final ServerWebExchange exchange) {
        return termService.getTermByNamespaceAndName(namespaceName, termName)
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
    public Mono<ResponseEntity<DataEntityList>> getTermLinkedEntities(final Long termId, final Integer page,
                                                                   final Integer size,
                                                                   final String query,
                                                                   final Integer entityClassId,
                                                                   final ServerWebExchange exchange) {
        return dataEntityService
            .listByTerm(termId, query, entityClassId, page, size)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DatasetFieldList>> getTermLinkedColumns(final Long termId, final Integer page,
                                                                       final Integer size,
                                                                       final String query,
                                                                       final ServerWebExchange exchange) {
        return datasetFieldService
            .listByTerm(termId, query, page, size)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<LinkedTermList>> getTermLinkedTerms(final Long termId, final Integer page,
                                                                   final Integer size, final String query,
                                                                   final ServerWebExchange exchange) {
        return termService
            .listByTerm(termId, query, page, size)
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

    @Override
    public Mono<ResponseEntity<QueryExample>>
        createQueryExampleToTermRelationship(final Long termId,
                                         final Mono<QueryExampleTermFormData> queryExampleTermFormData,
                                         final ServerWebExchange exchange) {
        return queryExampleTermFormData
            .flatMap(item -> queryExampleService.linkTermWithQueryExample(termId, item))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteQueryExampleToTermRelationship(final Long termId,
                                                                           final Long exampleId,
                                                                           final ServerWebExchange exchange) {
        return queryExampleService.removeTermFromQueryExample(termId, exampleId)
            .thenReturn(ResponseEntity.noContent().build());
    }

    @Override
    public Mono<ResponseEntity<LinkedTerm>> addLinkedTermToTerm(final Long termId,
                                                                final Mono<LinkedTermFormData> linkedTermFormData,
                                                                final ServerWebExchange exchange) {
        return linkedTermFormData
            .flatMap(fd -> termService.linkTermWithTerm(fd.getLinkedTermId(), termId))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteLinkedTermFromTerm(final Long termId, final Long linkedTermId,
                                                               final ServerWebExchange exchange) {
        return termService.removeTermToLinkedTermRelation(termId, linkedTermId)
            .thenReturn(ResponseEntity.noContent().build());
    }
}
