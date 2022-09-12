package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDto;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.utils.Page;

public interface DataEntityRepository extends CRUDRepository<DataEntityDimensionsDto> {
    Collection<DataEntityDetailsDto> listDetailsByOddrns(final Collection<String> oddrns);

    List<DataEntityDto> listDtosByOddrns(final Collection<String> oddrns, final boolean includeHollow);

    List<DataEntityDimensionsDto> listDimensionsByOddrns(final Collection<String> oddrns);

    List<DataEntityDimensionsDto> listAllByOddrns(final Collection<String> oddrns,
                                                  final Integer page,
                                                  final Integer size,
                                                  final boolean skipHollow);

    List<DataEntityDimensionsDto> listByEntityClass(final int page,
                                                    final int size,
                                                    final int entityClassId,
                                                    final Integer typeId);

    List<DataEntityDimensionsDto> listByTerm(final long termId, final String query, final Integer entityClassId,
                                             final int page, final int size);

    List<DataEntityDto> listByOwner(final int page, final int size, final long ownerId);

    List<String> listOddrnsByOwner(final long ownerId, final LineageStreamKind streamKind);

    List<? extends DataEntityDto> listPopular(final int page, final int size);

    Optional<DataEntityDetailsDto> getDetails(final long id);

    Page<DataEntityDimensionsDto> findByState(final FacetStateDto state, final int page, final int size);

    Page<DataEntityDimensionsDto> findByState(final FacetStateDto state,
                                              final int page,
                                              final int size,
                                              final OwnerPojo owner);

    List<DataEntityPojo> bulkCreate(final List<DataEntityPojo> pojos);

    List<DataEntityPojo> bulkUpdate(final List<DataEntityPojo> pojos);

    Optional<Long> incrementViewCount(final long id);

    Long countByState(final FacetStateDto state);

    Long countByState(final FacetStateDto state, final OwnerPojo ownerPojo);

    List<DataEntityDto> getQuerySuggestions(final String query, final Integer entityClassId,
                                            final Boolean manuallyCreated);

    List<DataEntityDimensionsDto> getDataEntityGroupsChildren(final Long dataEntityGroupId,
                                                              final Integer page,
                                                              final Integer size);
}
