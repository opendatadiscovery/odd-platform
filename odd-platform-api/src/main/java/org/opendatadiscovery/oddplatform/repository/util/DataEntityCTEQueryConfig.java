package org.opendatadiscovery.oddplatform.repository.util;

import java.util.List;
import lombok.Builder;
import lombok.Data;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.SortField;

import static org.opendatadiscovery.oddplatform.repository.util.FTSConstants.RANK_FIELD_ALIAS;

@Builder
@Data
public class DataEntityCTEQueryConfig {
    public static final String DATA_ENTITY_CTE_NAME = "dataEntityCTE";
    public static final String AGG_TAGS_RELATION_FIELD = "tags_relation";
    public static final String AGG_TAGS_FIELD = "tag";
    public static final String AGG_OWNERSHIP_FIELD = "ownership";
    public static final String AGG_OWNER_FIELD = "owner";
    public static final String AGG_TITLE_FIELD = "title";
    public static final String HAS_ALERTS_FIELD = "has_alerts";
    public static final String AGG_PARENT_ENTITY_FIELD = "parent_entity";
    public static final String AGG_METADATA_FIELD = "metadata";
    public static final String AGG_METADATA_VALUE_FIELD = "metadata_value";

    private List<Condition> conditions;
    private LimitOffset limitOffset;
    private SortField<?> orderBy;
    private Fts fts;
    private boolean includeDeleted;

    public record LimitOffset(int limit, int offset) {
    }

    public record Fts(Field<?> rankFieldAlias, String query) {
        public Fts(final String query) {
            this(RANK_FIELD_ALIAS, query);
        }
    }
}
