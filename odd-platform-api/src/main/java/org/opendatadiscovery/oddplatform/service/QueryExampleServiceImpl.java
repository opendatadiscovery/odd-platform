package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExample;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleDatasetFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleFormData;
import org.opendatadiscovery.oddplatform.dto.QueryExampleDto;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.DataEntityMapper;
import org.opendatadiscovery.oddplatform.mapper.QueryExampleMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityToQueryExamplePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityQueryExampleRelationRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleSearchEntrypointRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class QueryExampleServiceImpl implements QueryExampleService {
    private final ReactiveQueryExampleRepository queryExampleRepository;
    private final ReactiveQueryExampleSearchEntrypointRepository queryExampleSearchEntrypointRepository;
    private final ReactiveDataEntityQueryExampleRelationRepository dataEntityToQueryExampleRepository;
    private final ReactiveDataEntityRepository reactiveDataEntityRepository;
    private final DataEntityMapper dataEntityMapper;
    private final QueryExampleMapper queryExampleMapper;

    @Override
    @ReactiveTransactional
    public Mono<QueryExampleDetails> createQueryExample(final QueryExampleFormData queryExampleFormData) {
        final QueryExamplePojo pojo = queryExampleMapper.mapToPojo(queryExampleFormData);
        return queryExampleRepository.create(pojo)
            .map(queryExamplePojo -> queryExampleMapper.mapToDetails(queryExamplePojo, List.of()))
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
        final Long queryExampleId,
        final QueryExampleDatasetFormData queryExampleDatasetFormData) {
        return dataEntityToQueryExampleRepository
            .createRelationWithDataEntity(queryExampleDatasetFormData.getDatasetId(), queryExampleId)
            .switchIfEmpty(Mono.error(() -> new BadUserRequestException("Dataset assigned to Query Example")))
            .flatMap(pojo -> dataEntityToQueryExampleRepository.getQueryExampleDatasetRelations(queryExampleId))
            .map(dto -> reactiveDataEntityRepository
                .get(getRelatedDataEntitiesIds(dto).stream().toList())
                .collectList()
                .map(items -> queryExampleMapper.mapToQueryExample(
                    dto.queryExamplePojo(),
                    items)))
            .flatMap(Function.identity());
    }

    @Override
    @ReactiveTransactional
    public Mono<Void> deleteQueryExampleDatasetRelationship(final Long exampleId, final Long dataEntityId) {
        return dataEntityToQueryExampleRepository
            .removeRelationWithDataEntity(exampleId, dataEntityId)
            .then();
    }

    private Mono<QueryExampleDetails> update(final QueryExamplePojo pojo) {
        return queryExampleRepository.update(pojo)
            .flatMap(item -> dataEntityToQueryExampleRepository.getQueryExampleDatasetRelations(item.getId()))
            .map(dto -> reactiveDataEntityRepository
                .getDimensionsByIds(getRelatedDataEntitiesIds(dto))
                .collectList()
                .map(items -> queryExampleMapper.mapToQueryExampleDetails(
                    dto.queryExamplePojo(),
                    items)))
            .flatMap(Function.identity());
    }

    private static Set<Long> getRelatedDataEntitiesIds(final QueryExampleDto dto) {
        return dto.linkedEntities()
            .stream()
            .map(DataEntityToQueryExamplePojo::getDataEntityId)
            .collect(Collectors.toSet());
    }

    private Mono<QueryExampleDetails> updateSearchVectors(final QueryExampleDetails details) {
        return queryExampleSearchEntrypointRepository.updateQueryExampleVectors(details.getId())
            .thenReturn(details);
    }
}
