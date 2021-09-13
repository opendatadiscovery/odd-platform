package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.dto.DataEntityDetailsDto;
import com.provectus.oddplatform.dto.DataEntityDimensionsDto;
import com.provectus.oddplatform.dto.DataEntityDto;
import com.provectus.oddplatform.dto.DataEntityLineageDto;
import com.provectus.oddplatform.dto.FacetStateDto;
import com.provectus.oddplatform.dto.SearchFilterId;
import com.provectus.oddplatform.dto.StreamKind;
import com.provectus.oddplatform.model.tables.pojos.OwnerPojo;
import com.provectus.oddplatform.utils.Page;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface DataEntityRepository extends CRUDRepository<DataEntityDimensionsDto> {
    Collection<DataEntityDimensionsDto> listByOddrns(final Collection<String> oddrns);

    Collection<DataEntityDetailsDto> listDetailsByOddrns(final Collection<String> oddrns);

    List<DataEntityDimensionsDto> listAllByOddrns(final Collection<String> oddrns);

    List<DataEntityDimensionsDto> listByType(final int page,
                                             final int size,
                                             final long typeId,
                                             final Long subTypeId);

    List<DataEntityDto> listByOwner(final int page, final int size, final long ownerId);

    List<? extends DataEntityDto> listByOwner(final int page, final int size, final long ownerId,
                                              final StreamKind streamKind);

    List<? extends DataEntityDto> listPopular(final int page, final int size);

    Optional<DataEntityDetailsDto> getDetails(final long id);

    Optional<DataEntityLineageDto> getLineage(final long dataEntityId, final int lineageDepth);

    Page<DataEntityDimensionsDto> findByState(final FacetStateDto state, final int page, final int size);

    Page<DataEntityDimensionsDto> findByState(final FacetStateDto state,
                                              final int page,
                                              final int size,
                                              final OwnerPojo owner);

    List<DataEntityDto> bulkCreate(final List<DataEntityDto> dtos);

    List<DataEntityDto> bulkUpdate(final List<DataEntityDto> dtos);

    Optional<Long> incrementViewCount(final long id);

    void createHollow(final Collection<String> oddrns);

    Map<SearchFilterId, Long> getSubtypeFacet(final String facetQuery,
                                              final int page,
                                              final int size,
                                              final FacetStateDto state);

    Map<SearchFilterId, Long> getOwnerFacet(final String facetQuery,
                                            final int page,
                                            final int size,
                                            final FacetStateDto state);

    Map<SearchFilterId, Long> getTagFacet(final String facetQuery,
                                          final int page,
                                          final int size,
                                          final FacetStateDto state);

    Map<SearchFilterId, Long> getTypeFacet(final FacetStateDto state);

    Long countByState(final FacetStateDto state);

    Long countByState(final FacetStateDto state, final OwnerPojo ownerPojo);

    void setDescription(final long dataEntityId, final String description);

    void setInternalName(final long dataEntityId, final String businessName);

    void calculateSearchEntrypoints(final Collection<Long> newDataEntitiesIds,
                                    final Collection<Long> updatedDataEntitiesIds);

    void recalculateSearchEntrypoints(final long dataEntityId);

    List<DataEntityDto> getQuerySuggestions(final String query);
}
