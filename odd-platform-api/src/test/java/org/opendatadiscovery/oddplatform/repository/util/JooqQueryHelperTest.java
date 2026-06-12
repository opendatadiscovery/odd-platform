package org.opendatadiscovery.oddplatform.repository.util;

import java.util.ArrayList;
import java.util.List;
import org.jooq.Field;
import org.jooq.SQLDialect;
import org.jooq.impl.DSL;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG;

@DisplayName("Unit tests for JooqQueryHelper")
class JooqQueryHelperTest {

    private final JooqQueryHelper jooqQueryHelper = new JooqQueryHelper(DSL.using(SQLDialect.POSTGRES));

    /**
     * Computed alias fields (an aggregation like {@code sum(...) as "count"}, the FTS rank)
     * are not table columns: a select over ONE table's fields plus computed aliases is
     * homogeneous and must be paginatable — the shape {@code listMostPopular} paginates.
     */
    @Test
    @DisplayName("Accepts one table's fields plus computed (unqualified) alias fields")
    void testHomogeneityCheckAcceptsComputedAliases() {
        final List<Field<?>> fields = new ArrayList<>(List.of(TAG.fields()));
        fields.add(DSL.sum(DSL.field("usage", Integer.class)).as("count"));
        fields.add(DSL.boolOr(DSL.field("flag", Boolean.class)).as("external"));

        assertThatCode(() -> jooqQueryHelper.homogeneityCheck(fields))
            .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("Rejects fields coming from two different tables")
    void testHomogeneityCheckRejectsTwoTables() {
        final List<Field<?>> fields = List.of(TAG.ID, DATA_ENTITY.ID);

        assertThatThrownBy(() -> jooqQueryHelper.homogeneityCheck(fields))
            .isInstanceOf(IllegalArgumentException.class);
    }
}
