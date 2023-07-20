package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.Condition;
import org.jooq.Row2;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.term.TermBaseInfoDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldDescriptionUnhandledTermPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DatasetFieldDescriptionUnhandledTermRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import static org.jooq.impl.DSL.lower;
import static org.jooq.impl.DSL.row;
import static org.opendatadiscovery.oddplatform.model.Keys.DATASET_FIELD_DESCRIPTION_UNHANDLED_TERM_UNIQUE_KEY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD_DESCRIPTION_UNHANDLED_TERM;

@Repository
@RequiredArgsConstructor
public class DatasetFieldDescriptionUnhandledTermRepositoryImpl
    implements DatasetFieldDescriptionUnhandledTermRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Flux<DatasetFieldDescriptionUnhandledTermPojo> createUnhandledTerms(
        final List<DatasetFieldDescriptionUnhandledTermPojo> unhandledTerms) {
        if (unhandledTerms.isEmpty()) {
            return Flux.just();
        }
        final List<DatasetFieldDescriptionUnhandledTermRecord> records = unhandledTerms.stream()
            .map(p -> jooqReactiveOperations.newRecord(DATASET_FIELD_DESCRIPTION_UNHANDLED_TERM, p))
            .toList();

        var insertStep = DSL.insertInto(DATASET_FIELD_DESCRIPTION_UNHANDLED_TERM);

        for (int i = 0; i < records.size() - 1; i++) {
            insertStep = insertStep.set(records.get(i)).newRecord();
        }

        return jooqReactiveOperations.flux(
            insertStep.set(records.get(records.size() - 1))
                .onConflictOnConstraint(DATASET_FIELD_DESCRIPTION_UNHANDLED_TERM_UNIQUE_KEY)
                .doNothing()
                .returning(DATASET_FIELD_DESCRIPTION_UNHANDLED_TERM.fields())
        ).map(r -> r.into(DatasetFieldDescriptionUnhandledTermPojo.class));
    }

    @Override
    public Flux<DatasetFieldDescriptionUnhandledTermPojo> deleteForDatasetFieldExceptSpecified(
        final long datasetFieldId,
        final List<TermBaseInfoDto> termsToKeep) {
        final List<Row2<String, String>> termRows = termsToKeep.stream()
            .map(term -> row(lower(term.name()), lower(term.namespaceName())))
            .toList();
        final Condition condition;
        if (CollectionUtils.isNotEmpty(termRows)) {
            condition = row(lower(DATASET_FIELD_DESCRIPTION_UNHANDLED_TERM.TERM_NAME),
                lower(DATASET_FIELD_DESCRIPTION_UNHANDLED_TERM.TERM_NAMESPACE_NAME)).notIn(termRows);
        } else {
            condition = DSL.noCondition();
        }
        final var query = DSL.deleteFrom(DATASET_FIELD_DESCRIPTION_UNHANDLED_TERM)
            .where(DATASET_FIELD_DESCRIPTION_UNHANDLED_TERM.DATASET_FIELD_ID.eq(datasetFieldId)).and(condition)
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(DatasetFieldDescriptionUnhandledTermPojo.class));
    }

    @Override
    public Flux<DatasetFieldDescriptionUnhandledTermPojo> deleteUnhandledTerm(final TermBaseInfoDto dto) {
        final var query = DSL.deleteFrom(DATASET_FIELD_DESCRIPTION_UNHANDLED_TERM)
            .where(DATASET_FIELD_DESCRIPTION_UNHANDLED_TERM.TERM_NAME.equalIgnoreCase(dto.name())
                .and(DATASET_FIELD_DESCRIPTION_UNHANDLED_TERM.TERM_NAMESPACE_NAME.equalIgnoreCase(
                    dto.namespaceName())))
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(DatasetFieldDescriptionUnhandledTermPojo.class));
    }
}
