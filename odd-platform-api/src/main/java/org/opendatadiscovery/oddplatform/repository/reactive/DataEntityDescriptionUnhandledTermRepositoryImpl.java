package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.term.TermBaseInfoDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityDescriptionUnhandledTermPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DataEntityDescriptionUnhandledTermRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import static org.opendatadiscovery.oddplatform.model.Keys.DATA_ENTITY_DESCRIPTION_UNHANDLED_TERM_UNIQUE_KEY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_DESCRIPTION_UNHANDLED_TERM;

@Repository
@RequiredArgsConstructor
public class DataEntityDescriptionUnhandledTermRepositoryImpl implements DataEntityDescriptionUnhandledTermRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Flux<DataEntityDescriptionUnhandledTermPojo> createUnhandledTerms(
        final List<DataEntityDescriptionUnhandledTermPojo> unhandledTerms) {
        if (unhandledTerms.isEmpty()) {
            return Flux.just();
        }
        final List<DataEntityDescriptionUnhandledTermRecord> records = unhandledTerms.stream()
            .map(p -> jooqReactiveOperations.newRecord(DATA_ENTITY_DESCRIPTION_UNHANDLED_TERM, p))
            .toList();

        var insertStep = DSL.insertInto(DATA_ENTITY_DESCRIPTION_UNHANDLED_TERM);

        for (int i = 0; i < records.size() - 1; i++) {
            insertStep = insertStep.set(records.get(i)).newRecord();
        }

        return jooqReactiveOperations.flux(
            insertStep.set(records.get(records.size() - 1))
                .onConflictOnConstraint(DATA_ENTITY_DESCRIPTION_UNHANDLED_TERM_UNIQUE_KEY)
                .doNothing()
                .returning(DATA_ENTITY_DESCRIPTION_UNHANDLED_TERM.fields())
        ).map(r -> r.into(DataEntityDescriptionUnhandledTermPojo.class));
    }

    @Override
    public Flux<DataEntityDescriptionUnhandledTermPojo> deleteUnhandledTerm(final TermBaseInfoDto dto) {
        final var query = DSL.deleteFrom(DATA_ENTITY_DESCRIPTION_UNHANDLED_TERM)
            .where(DATA_ENTITY_DESCRIPTION_UNHANDLED_TERM.TERM_NAME.equalIgnoreCase(dto.name())
                .and(DATA_ENTITY_DESCRIPTION_UNHANDLED_TERM.TERM_NAMESPACE_NAME.equalIgnoreCase(
                    dto.namespaceName())))
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(DataEntityDescriptionUnhandledTermPojo.class));
    }
}
