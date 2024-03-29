package org.opendatadiscovery.oddplatform.repository.util;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.Table;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.dto.SearchFilterDto;

import static org.opendatadiscovery.oddplatform.model.Tables.LOOKUP_TABLES_SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.model.Tables.QUERY_EXAMPLE_SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.model.Tables.SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM_SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.repository.util.FTSEntity.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.repository.util.FTSEntity.LOOKUP_TABLES;
import static org.opendatadiscovery.oddplatform.repository.util.FTSEntity.QUERY_EXAMPLE;
import static org.opendatadiscovery.oddplatform.repository.util.FTSEntity.TERM;

public class FTSConfig {

    public static final Map<FTSEntity, FTSConfigDetails> FTS_CONFIG_DETAILS_MAP = Map.ofEntries(
        Map.entry(DATA_ENTITY, new FTSConfigDetails(SEARCH_ENTRYPOINT,
            SEARCH_ENTRYPOINT.DATA_ENTITY_ID,
            FTSConstants.DATA_ENTITY_FTS_WEIGHTS,
            FTSConstants.DATA_ENTITY_CONDITIONS)
        ),
        Map.entry(QUERY_EXAMPLE, new FTSConfigDetails(QUERY_EXAMPLE_SEARCH_ENTRYPOINT,
            QUERY_EXAMPLE_SEARCH_ENTRYPOINT.QUERY_EXAMPLE_ID,
            FTSConstants.QUERY_EXAMPLE_FTS_WEIGHTS,
            FTSConstants.QUERY_EXAMPLE_CONDITIONS)
        ),
        Map.entry(LOOKUP_TABLES, new FTSConfigDetails(LOOKUP_TABLES_SEARCH_ENTRYPOINT,
            LOOKUP_TABLES_SEARCH_ENTRYPOINT.LOOKUP_TABLE_ID,
            FTSConstants.LOOKUP_TABLES_FTS_WEIGHTS,
            FTSConstants.LOOKUP_TABLES_CONDITIONS)
        ),
        Map.entry(TERM, new FTSConfigDetails(TERM_SEARCH_ENTRYPOINT,
            TERM_SEARCH_ENTRYPOINT.TERM_ID,
            FTSConstants.TERM_FTS_WEIGHTS,
            FTSConstants.TERM_CONDITIONS)
        )
    );

    public record FTSConfigDetails(Table<?> vectorTable,
                            Field<Long> vectorTableIdField,
                            Map<Field<?>, String> ftsWeights,
                            Map<FacetType, Function<List<SearchFilterDto>, Condition>> conditionsMap) {
    }
}
