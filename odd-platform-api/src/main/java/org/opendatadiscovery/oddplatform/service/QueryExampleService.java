package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.QueryExample;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleList;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleRefList;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleTermFormData;
import reactor.core.publisher.Mono;

public interface QueryExampleService {
    Mono<QueryExampleDetails> createQueryExample(final QueryExampleFormData queryExampleFormData);

    Mono<QueryExampleDetails> updateQueryExample(final Long exampleId, final QueryExampleFormData formData);

    Mono<QueryExample> createQueryExampleToDatasetRelationship(
        final Long queryExampleId, final Long datasetId);

    Mono<Void> deleteQueryExampleDatasetRelationship(final Long exampleId, final Long dataEntityId);

    Mono<Void> deleteQueryExample(final Long exampleId);

    Mono<QueryExampleList> getQueryExampleByDatasetId(Long dataEntityId);

    Mono<QueryExampleDetails> getQueryExampleDetails(final Long exampleId);

    Mono<QueryExampleRefList> getQueryExampleList(final Integer page, final Integer size, final String query);

    Mono<QueryExample> linkTermWithQueryExample(final Long termId, final QueryExampleTermFormData item);

    Mono<Void> removeTermFromQueryExample(final Long termId, final Long exampleId);

    Mono<QueryExampleList> getQueryExampleByTermId(final Long termId);
}
