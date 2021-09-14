package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.DataEntity;
import com.provectus.oddplatform.api.contract.model.DataEntityDetails;
import com.provectus.oddplatform.api.contract.model.DataEntityLineage;
import com.provectus.oddplatform.api.contract.model.DataEntityList;
import com.provectus.oddplatform.api.contract.model.DataEntityRef;
import com.provectus.oddplatform.api.contract.model.DataEntityTagsFormData;
import com.provectus.oddplatform.api.contract.model.DataEntityTypeDictionary;
import com.provectus.oddplatform.api.contract.model.InternalDescription;
import com.provectus.oddplatform.api.contract.model.InternalDescriptionFormData;
import com.provectus.oddplatform.api.contract.model.InternalName;
import com.provectus.oddplatform.api.contract.model.InternalNameFormData;
import com.provectus.oddplatform.api.contract.model.MetadataFieldValue;
import com.provectus.oddplatform.api.contract.model.MetadataFieldValueList;
import com.provectus.oddplatform.api.contract.model.MetadataFieldValueUpdateFormData;
import com.provectus.oddplatform.api.contract.model.MetadataObject;
import com.provectus.oddplatform.api.contract.model.Tag;
import com.provectus.oddplatform.dto.LineageStreamKind;
import java.util.List;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface DataEntityService extends ReadOnlyCRUDService<DataEntity, DataEntityList> {
    Mono<DataEntityTypeDictionary> getDataEntityTypes();

    Mono<DataEntityDetails> getDetails(final long dataEntityId);

    Mono<DataEntityList> list(final Integer page,
                              final Integer size,
                              final long entityType,
                              final Long entitySubType);

    Flux<DataEntityRef> listAssociated(final int page, final int size);

    Flux<DataEntityRef> listAssociated(final int page, final int size, final LineageStreamKind streamKind);

    Flux<DataEntityRef> listPopular(final int page, final int size);

    Mono<MetadataFieldValueList> createMetadata(final long dataEntityId, final List<MetadataObject> metadata);

    Mono<Void> deleteMetadata(final long dataEntityId, final long metadataFieldId);

    Mono<InternalDescription> upsertDescription(final long dataEntityId, final InternalDescriptionFormData formData);

    Mono<InternalName> upsertBusinessName(final long dataEntityId, final InternalNameFormData formData);

    Flux<Tag> upsertTags(final long dataEntityId, final DataEntityTagsFormData tagsFormData);

    Mono<MetadataFieldValue> upsertMetadataFieldValue(final long dataEntityId,
                                                      final long metadataFieldId,
                                                      final MetadataFieldValueUpdateFormData formData);

    Mono<DataEntityLineage> getLineage(final long dataEntityId,
                                       final int lineageDepth,
                                       final LineageStreamKind streamKind);
}
