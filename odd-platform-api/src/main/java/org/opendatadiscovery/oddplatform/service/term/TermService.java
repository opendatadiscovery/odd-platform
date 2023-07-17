package org.opendatadiscovery.oddplatform.service.term;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.Tag;
import org.opendatadiscovery.oddplatform.api.contract.model.TagsFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TermDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.TermFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRef;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRefList;
import org.opendatadiscovery.oddplatform.dto.term.DescriptionParsedTerms;
import org.opendatadiscovery.oddplatform.dto.term.LinkedTermDto;
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

    Mono<Void> updateDataEntityDescriptionTermsState(final DescriptionParsedTerms terms,
                                                     final long dataEntityId);

    Mono<TermRef> linkTermWithDatasetField(final Long termId, final Long datasetFieldId);

    Mono<Void> removeTermFromDatasetField(final Long termId, final Long datasetFieldId);

    Mono<Void> updateDatasetFieldDescriptionTermsState(final DescriptionParsedTerms terms,
                                                       final long datasetFieldId);

    Flux<Tag> upsertTags(final Long termId, final TagsFormData tagsFormData);

    Mono<List<LinkedTermDto>> getDataEntityTerms(final long dataEntityId);

    Mono<List<LinkedTermDto>> getDatasetFieldTerms(final long datasetFieldId);

    Mono<DescriptionParsedTerms> findTermsInDescription(final String description);
}
