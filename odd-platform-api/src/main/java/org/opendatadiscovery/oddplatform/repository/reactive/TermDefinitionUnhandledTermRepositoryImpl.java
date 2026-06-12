package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.Condition;
import org.jooq.Row2;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.term.TermBaseInfoDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermDefinitionUnhandledTermPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.TermDefinitionUnhandledTermRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import static org.jooq.impl.DSL.lower;
import static org.jooq.impl.DSL.row;
import static org.opendatadiscovery.oddplatform.model.Keys.TERM_DEFINITION_UNHANDLED_TERM_UNIQUE_KEY;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM_DEFINITION_UNHANDLED_TERM;

@Repository
@RequiredArgsConstructor
public class TermDefinitionUnhandledTermRepositoryImpl implements TermDefinitionUnhandledTermRepository {

    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Flux<TermDefinitionUnhandledTermPojo>
        deleteForTermExceptSpecified(final long termId,
                                     final List<TermBaseInfoDto> termsToKeep) {
        final List<Row2<String, String>> termRows = termsToKeep.stream()
            .map(term -> row(lower(term.name()), lower(term.namespaceName())))
            .toList();
        final Condition condition;
        if (CollectionUtils.isNotEmpty(termRows)) {
            condition = row(lower(TERM_DEFINITION_UNHANDLED_TERM.TERM_NAME),
                lower(TERM_DEFINITION_UNHANDLED_TERM.TERM_NAMESPACE_NAME)).notIn(termRows);
        } else {
            condition = DSL.noCondition();
        }
        final var query = DSL.deleteFrom(TERM_DEFINITION_UNHANDLED_TERM)
            .where(TERM_DEFINITION_UNHANDLED_TERM.TARGET_TERM_ID.eq(termId)).and(condition)
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(TermDefinitionUnhandledTermPojo.class));
    }

    @Override
    public Flux<TermDefinitionUnhandledTermPojo> createUnhandledTerms(
        final List<TermDefinitionUnhandledTermPojo> unhandledTerms) {
        if (unhandledTerms.isEmpty()) {
            return Flux.just();
        }
        final List<TermDefinitionUnhandledTermRecord> records = unhandledTerms.stream()
            .map(p -> jooqReactiveOperations.newRecord(TERM_DEFINITION_UNHANDLED_TERM, p))
            .toList();

        var insertStep = DSL.insertInto(TERM_DEFINITION_UNHANDLED_TERM);

        for (int i = 0; i < records.size() - 1; i++) {
            insertStep = insertStep.set(records.get(i)).newRecord();
        }

        return jooqReactiveOperations.flux(
            insertStep.set(records.get(records.size() - 1))
                .onConflictOnConstraint(TERM_DEFINITION_UNHANDLED_TERM_UNIQUE_KEY)
                .doNothing()
                .returning(TERM_DEFINITION_UNHANDLED_TERM.fields())
        ).map(r -> r.into(TermDefinitionUnhandledTermPojo.class));
    }
}
