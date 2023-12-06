package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesDefinitionsPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.LookupTablesDefinitionsRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;

import static org.opendatadiscovery.oddplatform.model.Tables.LOOKUP_TABLES_DEFINITIONS;

@Repository
public class ReactiveLookupTableDefinitionRepositoryImpl
    extends ReactiveAbstractCRUDRepository<LookupTablesDefinitionsRecord, LookupTablesDefinitionsPojo>
    implements ReactiveLookupTableDefinitionRepository {

    public ReactiveLookupTableDefinitionRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                                       final JooqQueryHelper jooqQueryHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, LOOKUP_TABLES_DEFINITIONS, LookupTablesDefinitionsPojo.class);
    }
}
