package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExample;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleList;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleRefList;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleTermFormData;
import org.opendatadiscovery.oddplatform.dto.QueryExampleDto;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.QueryExampleMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityQueryExampleRelationRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermQueryExampleRelationRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;

@Service
@RequiredArgsConstructor
public class QueryExampleServiceImpl implements QueryExampleService {
    private final ReactiveQueryExampleRepository queryExampleRepository;
    private final ReactiveQueryExampleSearchEntrypointRepository queryExampleSearchEntrypointRepository;
    private final ReactiveDataEntityQueryExampleRelationRepository dataEntityToQueryExampleRepository;
    private final ReactiveTermQueryExampleRelationRepository termQueryExampleRelationRepository;
    private final DataEntityService dataEntityService;
    private final QueryExampleMapper queryExampleMapper;

    @Override
    @ReactiveTransactional
    public Mono<QueryExampleDetails> createQueryExample(final QueryExampleFormData queryExampleFormData) {
        final QueryExamplePojo pojo = queryExampleMapper.mapToPojo(queryExampleFormData);
        return queryExampleRepository.create(pojo)
            .map(
                queryExamplePojo -> queryExampleMapper.mapToQueryExampleDetails(queryExamplePojo, List.of(), List.of()))
            .flatMap(this::updateSearchVectors);
    }

    @Override
    @ReactiveTransactional
    public Mono<QueryExampleDetails> updateQueryExample(final Long exampleId, final QueryExampleFormData formData) {
        return queryExampleRepository.get(exampleId)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("QueryExample", exampleId)))
            .flatMap(item -> this.update(queryExampleMapper.applyToPojo(formData, item)))
            .flatMap(this::updateSearchVectors);
    }

    @Override
    @ReactiveTransactional
    public Mono<QueryExample> createQueryExampleToDatasetRelationship(
        final Long queryExampleId, final Long datasetId) {
        return dataEntityToQueryExampleRepository
            .createRelationWithDataEntity(datasetId, queryExampleId)
            .switchIfEmpty(Mono.error(() -> new BadUserRequestException("Dataset assigned to Query Example")))
            .then(dataEntityToQueryExampleRepository.getQueryExampleDatasetRelations(queryExampleId))
            .map(dto -> queryExampleMapper.mapToQueryExample(
                dto.queryExamplePojo(),
                dto.linkedEntities(),
                dto.linkedTerms()))
            .zipWith(queryExampleSearchEntrypointRepository.updateQueryExampleVectorsForDataEntity(queryExampleId))
            .map(Tuple2::getT1);
    }

    @Override
    @ReactiveTransactional
    public Mono<Void> deleteQueryExampleDatasetRelationship(final Long exampleId, final Long dataEntityId) {
        return dataEntityToQueryExampleRepository
            .removeRelationWithDataEntityByQueryId(exampleId, dataEntityId)
            .then(queryExampleSearchEntrypointRepository.updateQueryExampleVectorsForDataEntity(exampleId))
            .then();
    }

    @Override
    @ReactiveTransactional
    public Mono<Void> deleteQueryExample(final Long exampleId) {
        return queryExampleRepository.get(exampleId)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("QueryExample", exampleId)))
            .thenMany(dataEntityToQueryExampleRepository.removeRelationWithDataEntityByQueryId(exampleId))
            .thenMany(termQueryExampleRelationRepository.removeRelationWithTermByQueryId(exampleId))
            .then(queryExampleRepository.delete(exampleId).map(QueryExamplePojo::getId))
            .then();
    }

    @Override
    public Mono<QueryExampleList> getQueryExampleByDatasetId(final Long dataEntityId) {
        return dataEntityToQueryExampleRepository
            .getQueryExampleDatasetRelationsByDataEntity(dataEntityId)
            .collectList()
            .map(queryExampleMapper::mapListToQueryExampleList);
    }

    @Override
    public Mono<QueryExampleDetails> getQueryExampleDetails(final Long exampleId) {
        return queryExampleRepository.get(exampleId)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("QueryExample", exampleId)))
            .then(dataEntityToQueryExampleRepository.getQueryExampleDatasetRelations(exampleId))
            .map(dto -> dataEntityService
                .getDimensionsByIds(getRelatedDataEntitiesIds(dto))
                .map(items -> queryExampleMapper.mapToQueryExampleDetails(
                    dto.queryExamplePojo(), items, dto.linkedTerms())))
            .flatMap(Function.identity());
    }

    @Override
    public Mono<QueryExampleRefList> getQueryExampleList(final Integer page, final Integer size, final String query) {
        return queryExampleRepository.listQueryExample(page, size, query)
            .map(queryExampleMapper::mapToRefPage);
    }

    @Override
    @ReactiveTransactional
    public Mono<QueryExample> linkTermWithQueryExample(final Long termId, final QueryExampleTermFormData item) {
        return termQueryExampleRelationRepository.createRelationWithQueryExample(item.getQueryExampleId(), termId)
            .switchIfEmpty(Mono.error(() -> new BadUserRequestException("Term is assigned to Query Example")))
            .then(dataEntityToQueryExampleRepository.getQueryExampleDatasetRelations(item.getQueryExampleId()))
            .map(dto -> queryExampleMapper.mapToQueryExample(dto.queryExamplePojo(), dto.linkedEntities(),
                dto.linkedTerms()))
            .zipWith(
                queryExampleSearchEntrypointRepository.updateQueryExampleVectorsForDataEntity(item.getQueryExampleId()))
            .map(Tuple2::getT1);
    }

    @Override
    @ReactiveTransactional
    public Mono<Void> removeTermFromQueryExample(final Long termId, final Long exampleId) {
        return termQueryExampleRelationRepository.deleteRelationWithQueryExample(exampleId, termId)
            .then();
    }

    @Override
    public Mono<QueryExampleList> getQueryExampleByTermId(final Long termId) {
        return termQueryExampleRelationRepository
            .getQueryExampleDatasetRelationsByTerm(termId)
            .collectList()
            .map(queryExampleMapper::mapListToQueryExampleList);
    }

    private Mono<QueryExampleDetails> update(final QueryExamplePojo pojo) {
        return queryExampleRepository.update(pojo)
            .flatMap(item -> dataEntityToQueryExampleRepository.getQueryExampleDatasetRelations(item.getId()))
            .map(dto -> dataEntityService
                .getDimensionsByIds(getRelatedDataEntitiesIds(dto))
                .map(items -> queryExampleMapper.mapToQueryExampleDetails(
                    dto.queryExamplePojo(), items, dto.linkedTerms())))
            .flatMap(Function.identity());
    }

    private static Set<Long> getRelatedDataEntitiesIds(final QueryExampleDto dto) {
        return dto.linkedEntities()
            .stream()
            .map(DataEntityPojo::getId)
            .collect(Collectors.toSet());
    }

    private Mono<QueryExampleDetails> updateSearchVectors(final QueryExampleDetails details) {
        return queryExampleSearchEntrypointRepository.updateQueryExampleVectors(details.getId())
            .thenReturn(details);
    }
}
