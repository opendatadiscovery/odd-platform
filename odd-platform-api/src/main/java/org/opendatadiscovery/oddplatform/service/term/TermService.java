package org.opendatadiscovery.oddplatform.service.term;

import java.time.OffsetDateTime;
import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.LinkedTerm;
import org.opendatadiscovery.oddplatform.api.contract.model.LinkedTermList;
import org.opendatadiscovery.oddplatform.api.contract.model.Tag;
import org.opendatadiscovery.oddplatform.api.contract.model.TagsFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TermDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.TermFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRef;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRefList;
import org.opendatadiscovery.oddplatform.dto.term.LinkedTermDto;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface TermService {
    Mono<TermRefList> getTerms(final Integer page, final Integer size, final String query,
                               final OffsetDateTime updatedAtRangeStartDateTime,
                               final OffsetDateTime updatedAtRangeEndDateTime);

    Mono<TermRef> getTermByNamespaceAndName(final String namespaceName, final String name);

    Mono<TermDetails> createTerm(final TermFormData formData);

    Mono<TermDetails> updateTerm(final Long id, final TermFormData formData);

    Mono<TermDetails> getTermDetails(final Long id);

    Mono<Long> delete(final long id);

    Mono<LinkedTerm> linkTermWithDataEntity(final Long termId, final Long dataEntityId);

    Mono<Void> removeTermFromDataEntity(final Long termId, final Long dataEntityId);

    Mono<List<LinkedTermDto>> handleDataEntityDescriptionTerms(final long dataEntityId,
                                                               final String description);

    Mono<LinkedTerm> linkTermWithDatasetField(final Long termId, final Long datasetFieldId);

    Mono<Void> removeTermFromDatasetField(final Long termId, final Long datasetFieldId);

    Mono<List<LinkedTermDto>> handleDatasetFieldDescriptionTerms(final long datasetFieldId,
                                                                 final String description);

    Flux<Tag> upsertTags(final Long termId, final TagsFormData tagsFormData);

    Mono<List<LinkedTermDto>> getDataEntityTerms(final long dataEntityId);

    Mono<List<LinkedTermDto>> getDatasetFieldTerms(final long datasetFieldId);

    Mono<LinkedTermList> listByTerm(final Long termId, final String query, final Integer page, final Integer size);

    Mono<LinkedTerm> linkTermWithTerm(final Long linkedTermId, final Long termId);

    Mono<Void> removeTermToLinkedTermRelation(final Long termId, final Long linkedTermId);
}
