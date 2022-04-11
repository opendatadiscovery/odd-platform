package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityGroupLineageDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityLineageDto;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.LineageStreamKind;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.utils.Page;

public interface DataEntityRepository extends CRUDRepository<DataEntityDimensionsDto> {
    Collection<DataEntityDetailsDto> listDetailsByOddrns(final Collection<String> oddrns);

    List<DataEntityDto> listDtosByOddrns(final Collection<String> oddrns, final boolean includeHollow);

    List<DataEntityDimensionsDto> listDimensionsByOddrns(final Collection<String> oddrns);

    List<DataEntityDimensionsDto> listByEntityClass(final int page,
                                             final int size,
                                             final int entityClassId,
                                             final Integer typeId);

    List<DataEntityDto> listByOwner(final int page, final int size, final long ownerId);

    List<? extends DataEntityDto> listByOwner(final int page,
                                              final int size,
                                              final long ownerId,
                                              final LineageStreamKind streamKind);

    List<? extends DataEntityDto> listPopular(final int page, final int size);

    Optional<DataEntityDetailsDto> getDetails(final long id);

    Optional<DataEntityLineageDto> getLineage(final long dataEntityId,
                                              final int lineageDepth,
                                              final LineageStreamKind streamKind);

    Optional<DataEntityGroupLineageDto> getDataEntityGroupLineage(final Long dataEntityGroupId);

    Page<DataEntityDimensionsDto> findByState(final FacetStateDto state, final int page, final int size);

    Page<DataEntityDimensionsDto> findByState(final FacetStateDto state,
                                              final int page,
                                              final int size,
                                              final OwnerPojo owner);

    List<DataEntityPojo> bulkCreate(final List<DataEntityPojo> pojos);

    List<DataEntityPojo> bulkUpdate(final List<DataEntityPojo> pojos);

    Optional<Long> incrementViewCount(final long id);

    void createHollow(final Collection<String> oddrns);

    Long countByState(final FacetStateDto state);

    Long countByState(final FacetStateDto state, final OwnerPojo ownerPojo);

    void setDescription(final long dataEntityId, final String description);

    void setInternalName(final long dataEntityId, final String businessName);

    void calculateSearchEntrypoints(final Collection<Long> dataEntityIds);

    void calculateDataEntityVectors(final Collection<Long> ids);

    void calculateTagVectors(final Collection<Long> ids);

    void calculateNamespaceVectors(final Collection<Long> ids);

    void calculateDataSourceVectors(final Collection<Long> ids);

    void calculateMetadataVectors(final Collection<Long> ids);

    List<DataEntityDto> getQuerySuggestions(final String query);

    List<DataEntityDimensionsDto> getDataEntityGroupsChildren(final Long dataEntityGroupId,
                                                              final Integer page,
                                                              final Integer size);
}
