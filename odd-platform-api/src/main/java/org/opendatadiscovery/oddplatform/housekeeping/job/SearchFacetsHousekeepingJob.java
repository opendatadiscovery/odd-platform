package org.opendatadiscovery.oddplatform.housekeeping.job;

import java.sql.Connection;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.housekeeping.config.HousekeepingTTLProperties;
import org.springframework.stereotype.Component;

import static org.opendatadiscovery.oddplatform.model.tables.SearchFacets.SEARCH_FACETS;

@Component
@RequiredArgsConstructor
@Slf4j
public class SearchFacetsHousekeepingJob implements HousekeepingJob {
    private final HousekeepingTTLProperties housekeepingTTLProperties;

    @Override
    public void doHousekeeping(final Connection connection) {
        final DSLContext dslContext = DSL.using(connection);

        final int deletedSearchFacets = dslContext
            .deleteFrom(SEARCH_FACETS)
            .where(SEARCH_FACETS.LAST_ACCESSED_AT.lessOrEqual(
                DSL.currentOffsetDateTime().minus(housekeepingTTLProperties.getSearchFacetsDays())))
            .execute();

        log.debug("Housekeeping job deleted {} outdated search facets", deletedSearchFacets);
    }
}
