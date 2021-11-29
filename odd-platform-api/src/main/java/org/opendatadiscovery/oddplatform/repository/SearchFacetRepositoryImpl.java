package org.opendatadiscovery.oddplatform.repository;

import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.opendatadiscovery.oddplatform.model.tables.pojos.SearchFacetsPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.SearchFacetsRecord;
import org.springframework.stereotype.Repository;

import static org.opendatadiscovery.oddplatform.model.Tables.SEARCH_FACETS;

@Repository
@RequiredArgsConstructor
public class SearchFacetRepositoryImpl implements SearchFacetRepository {
    private final DSLContext dslContext;

    @Override
    public SearchFacetsPojo persistFacetState(final SearchFacetsPojo pojo) {
        final SearchFacetsRecord searchFacetsRecord = dslContext.newRecord(SEARCH_FACETS, pojo);
        searchFacetsRecord.store();
        return searchFacetsRecord.into(SearchFacetsPojo.class);
    }

    @Override
    public SearchFacetsPojo updateFacetState(final SearchFacetsPojo pojo) {
        final SearchFacetsRecord record = dslContext.newRecord(SEARCH_FACETS, pojo);
        record.changed(SEARCH_FACETS.ID, false);
        record.store();
        return pojo;
    }

    @Override
    public Optional<SearchFacetsPojo> getFacetState(final UUID id) {
        return dslContext.selectFrom(SEARCH_FACETS)
            .where(SEARCH_FACETS.ID.eq(id))
            .fetchOptionalInto(SearchFacetsPojo.class);
    }
}
