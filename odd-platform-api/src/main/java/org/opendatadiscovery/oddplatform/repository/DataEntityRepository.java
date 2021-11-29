package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityLineageDto;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.LineageStreamKind;
import org.opendatadiscovery.oddplatform.dto.SearchFilterId;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.utils.Page;

public interface DataEntityRepository extends CRUDRepository<DataEntityDimensionsDto> {
    Collection<DataEntityDimensionsDto> listByOddrns(final Collection<String> oddrns);

    Collection<DataEntityDetailsDto> listDetailsByOddrns(final Collection<String> oddrns);

    List<DataEntityDimensionsDto> listAllByOddrns(final Collection<String> oddrns);

    List<DataEntityDimensionsDto> listByType(final int page,
                                             final int size,
                                             final long typeId,
                                             final Long subTypeId);

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

    void calculateSearchEntrypoints(final Collection<Long> dataEntityIds);

    void calculateDataEntityVectors(final Collection<Long> ids);

    void calculateTagVectors(final Collection<Long> ids);

    void calculateNamespaceVectors(final Collection<Long> ids);

    void calculateDataSourceVectors(final Collection<Long> ids);

    void calculateMetadataVectors(final Collection<Long> ids);

    List<DataEntityDto> getQuerySuggestions(final String query);
}
