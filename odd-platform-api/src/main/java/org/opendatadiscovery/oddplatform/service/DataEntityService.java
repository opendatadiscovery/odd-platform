package org.opendatadiscovery.oddplatform.service;

import java.util.Collection;
import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityClassAndTypeDictionary;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDataEntityGroupFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityUsageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.InternalDescription;
import org.opendatadiscovery.oddplatform.api.contract.model.InternalDescriptionFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.InternalName;
import org.opendatadiscovery.oddplatform.api.contract.model.InternalNameFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldValue;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldValueList;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldValueUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataObject;
import org.opendatadiscovery.oddplatform.api.contract.model.Tag;
import org.opendatadiscovery.oddplatform.api.contract.model.TagsFormData;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GroupEntityRelationsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface DataEntityService {
    Mono<DataEntityClassAndTypeDictionary> getDataEntityClassesAndTypes();

    Mono<DataEntityDimensionsDto> getDimensions(final long dataEntityId);

    Mono<List<DataEntityDimensionsDto>> getDimensions(final Collection<String> oddrns);

    default Mono<DataEntityList> findByState(final FacetStateDto state, final int page, final int size) {
        return findByState(state, page, size, null);
    }

    Mono<DataEntityList> findByState(final FacetStateDto state,
                                     final int page,
                                     final int size,
                                     final OwnerPojo owner);

    Mono<DataEntityDetails> getDetails(final long dataEntityId);

    Mono<List<String>> getDependentDataEntityOddrns(final LineageStreamKind streamKind);

    Flux<DataEntityRef> listAssociated(final int page, final int size);

    Flux<DataEntityRef> listAssociated(final int page, final int size, final LineageStreamKind streamKind);

    Flux<DataEntityRef> listPopular(final int page, final int size);

    Mono<DataEntityList> listByTerm(final long termId, final String query, final Integer entityClassId,
                                    final int page, final int size);

    Mono<MetadataFieldValueList> createMetadata(final long dataEntityId, final List<MetadataObject> metadata);

    Mono<Void> deleteMetadata(final long dataEntityId, final long metadataFieldId);

    Mono<InternalDescription> upsertDescription(final long dataEntityId, final InternalDescriptionFormData formData);

    Mono<InternalName> upsertBusinessName(final long dataEntityId, final InternalNameFormData formData);

    Flux<Tag> upsertTags(final long dataEntityId, final TagsFormData tagsFormData);

    Mono<MetadataFieldValue> upsertMetadataFieldValue(final long dataEntityId,
                                                      final long metadataFieldId,
                                                      final MetadataFieldValueUpdateFormData formData);

    Mono<DataEntityList> getDataEntityGroupsChildren(final Long dataEntityGroupId,
                                                     final Integer page,
                                                     final Integer size);

    Mono<DataEntityRef> addDataEntityToDEG(final Long dataEntityId, final DataEntityDataEntityGroupFormData formData);

    Flux<GroupEntityRelationsPojo> deleteDataEntityFromDEG(final Long dataEntityId, final Long dataEntityGroupId);

    Mono<DataEntityUsageInfo> getDataEntityUsageInfo();
}
