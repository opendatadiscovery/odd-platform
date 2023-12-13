package org.opendatadiscovery.oddplatform.repository.reactive;

import org.jooq.Record;
import org.jooq.SelectHavingStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.LookupTableColumnDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesDefinitionsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.LookupTablesDefinitionsRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.LOOKUP_TABLES;
import static org.opendatadiscovery.oddplatform.model.Tables.LOOKUP_TABLES_DEFINITIONS;

@Repository
public class ReactiveLookupTableDefinitionRepositoryImpl
    extends ReactiveAbstractCRUDRepository<LookupTablesDefinitionsRecord, LookupTablesDefinitionsPojo>
    implements ReactiveLookupTableDefinitionRepository {

    public ReactiveLookupTableDefinitionRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                                       final JooqQueryHelper jooqQueryHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, LOOKUP_TABLES_DEFINITIONS, LookupTablesDefinitionsPojo.class);
    }

    public Mono<LookupTableColumnDto> getLookupColumnWithTable(final Long columnId) {
        final SelectHavingStep<Record> query = DSL.select(LOOKUP_TABLES_DEFINITIONS.asterisk())
            .select(LOOKUP_TABLES.asterisk())
            .from(LOOKUP_TABLES_DEFINITIONS)
            .join(LOOKUP_TABLES)
            .on(LOOKUP_TABLES.ID.eq(LOOKUP_TABLES_DEFINITIONS.LOOKUP_TABLE_ID))
            .where(LOOKUP_TABLES_DEFINITIONS.ID.eq(columnId));

        return jooqReactiveOperations.mono(query)
            .map(r -> new LookupTableColumnDto(
                r.into(LOOKUP_TABLES).into(LookupTablesPojo.class),
                r.into(LOOKUP_TABLES_DEFINITIONS).into(LookupTablesDefinitionsPojo.class)));
    }
}
