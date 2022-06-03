package org.opendatadiscovery.oddplatform.repository.util;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.Table;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.dto.SearchFilterDto;

import static org.opendatadiscovery.oddplatform.model.Tables.SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM_SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.repository.util.FTSEntity.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.repository.util.FTSEntity.TERM;

public class FTSConfig {

    public static final Map<FTSEntity, FTSConfigDetails> FTS_CONFIG_DETAILS_MAP = Map.ofEntries(
        Map.entry(DATA_ENTITY, new FTSConfigDetails(SEARCH_ENTRYPOINT,
            SEARCH_ENTRYPOINT.DATA_ENTITY_ID,
            FTSConstants.DATA_ENTITY_FTS_WEIGHTS,
            FTSConstants.DATA_ENTITY_CONDITIONS)
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
