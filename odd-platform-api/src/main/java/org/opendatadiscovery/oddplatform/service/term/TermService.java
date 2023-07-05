package org.opendatadiscovery.oddplatform.service.term;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.Tag;
import org.opendatadiscovery.oddplatform.api.contract.model.TagsFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TermDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.TermFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRef;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRefList;
import org.opendatadiscovery.oddplatform.dto.term.LinkedTermDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityToTermPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldToTermPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface TermService {
    Mono<TermRefList> getTerms(final Integer page, final Integer size, final String query);

    Mono<TermRef> getTermByNamespaceAndName(final String namespaceName, final String name);

    Mono<TermDetails> createTerm(final TermFormData formData);

    Mono<TermDetails> updateTerm(final Long id, final TermFormData formData);

    Mono<TermDetails> getTermDetails(final Long id);

    Mono<Long> delete(final long id);

    Mono<TermRef> linkTermWithDataEntity(final Long termId, final Long dataEntityId);

    Mono<Void> removeTermFromDataEntity(final Long termId, final Long dataEntityId);

    Flux<DataEntityToTermPojo> updateDataEntityDescriptionTermsState(final List<TermPojo> terms,
                                                                     final long dataEntityId);

    Mono<TermRef> linkTermWithDatasetField(final Long termId, final Long datasetFieldId);

    Mono<Void> removeTermFromDatasetField(final Long termId, final Long datasetFieldId);

    Flux<DatasetFieldToTermPojo> updateDatasetFieldDescriptionTermsState(final List<TermPojo> terms,
                                                                         final long datasetFieldId);

    Flux<Tag> upsertTags(final Long termId, final TagsFormData tagsFormData);

    Mono<List<LinkedTermDto>> getDataEntityTerms(final long dataEntityId);

    Mono<List<LinkedTermDto>> getDatasetFieldTerms(final long datasetFieldId);

    Mono<List<TermPojo>> findTermsInDescription(final String description);
}
