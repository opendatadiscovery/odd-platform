package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.dto.masking.DatasetFieldMaskingDto;
import org.opendatadiscovery.oddplatform.dto.masking.MaskingRuleDto;
import org.opendatadiscovery.oddplatform.dto.masking.MaskingRuleType;
import lombok.RequiredArgsConstructor;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

@Repository
@RequiredArgsConstructor
public class ReactiveDatasetFieldMaskingRepositoryImpl {
    private static final String FIELD_MASKING_TABLE = "dataset_field_masking";
    private static final String MASKING_RULE_TABLE = "masking_rule";

    private final JooqReactiveOperations jooqReactiveOperations;

    public Mono<DatasetFieldMaskingDto> getByFieldId(final long datasetFieldId) {
        final var query = DSL.select(
                DSL.field("dfm.id", Long.class),
                DSL.field("dfm.dataset_field_id", Long.class),
                DSL.field("mr.id", Long.class),
                DSL.field("mr.name", String.class),
                DSL.field("mr.type", String.class),
                DSL.field("mr.replacement", String.class),
                DSL.field("mr.pattern", String.class)
            )
            .from(DSL.table(FIELD_MASKING_TABLE).as("dfm"))
            .join(DSL.table(MASKING_RULE_TABLE).as("mr"))
            .on(DSL.field("dfm.masking_rule_id").eq(DSL.field("mr.id")))
            .where(DSL.field("dfm.dataset_field_id").eq(datasetFieldId))
            .and(DSL.field("mr.is_deleted").eq(false));

        return jooqReactiveOperations.mono(query)
            .map(r -> {
                final MaskingRuleDto rule = MaskingRuleDto.builder()
                    .id(r.component3())
                    .name(r.component4())
                    .type(MaskingRuleType.valueOf(r.component5()))
                    .replacement(r.component6())
                    .pattern(r.component7())
                    .build();
                return DatasetFieldMaskingDto.builder()
                    .id(r.component1())
                    .datasetFieldId(r.component2())
                    .maskingRule(rule)
                    .build();
            });
    }

    public Mono<List<DatasetFieldMaskingDto>> getByDatasetId(final long datasetId) {
        final var query = DSL.select(
                DSL.field("dfm.id", Long.class),
                DSL.field("dfm.dataset_field_id", Long.class),
                DSL.field("mr.id", Long.class),
                DSL.field("mr.name", String.class),
                DSL.field("mr.type", String.class),
                DSL.field("mr.replacement", String.class),
                DSL.field("mr.pattern", String.class)
            )
            .from(DSL.table(FIELD_MASKING_TABLE).as("dfm"))
            .join(DSL.table(MASKING_RULE_TABLE).as("mr"))
            .on(DSL.field("dfm.masking_rule_id").eq(DSL.field("mr.id")))
            .join(DSL.table("dataset_structure").as("ds"))
            .on(DSL.field("ds.dataset_field_id").eq(DSL.field("dfm.dataset_field_id")))
            .where(DSL.field("ds.dataset_data_entity_id").eq(datasetId))
            .and(DSL.field("mr.is_deleted").eq(false));

        return jooqReactiveOperations.flux(query)
            .map(r -> {
                final MaskingRuleDto rule = MaskingRuleDto.builder()
                    .id(r.component3())
                    .name(r.component4())
                    .type(MaskingRuleType.valueOf(r.component5()))
                    .replacement(r.component6())
                    .pattern(r.component7())
                    .build();
                return DatasetFieldMaskingDto.builder()
                    .id(r.component1())
                    .datasetFieldId(r.component2())
                    .maskingRule(rule)
                    .build();
            })
            .collectList();
    }

    public Mono<Void> applyMasking(final long datasetFieldId, final long ruleId) {
        final var deleteQuery = DSL.deleteFrom(DSL.table(FIELD_MASKING_TABLE))
            .where(DSL.field("dataset_field_id").eq(datasetFieldId));

        final var insertQuery = DSL.insertInto(DSL.table(FIELD_MASKING_TABLE))
            .columns(
                DSL.field("dataset_field_id"),
                DSL.field("masking_rule_id")
            )
            .values(datasetFieldId, ruleId);

        return jooqReactiveOperations.mono(deleteQuery)
            .then(jooqReactiveOperations.mono(insertQuery))
            .then();
    }

    public Mono<Void> removeMasking(final long datasetFieldId) {
        final var deleteQuery = DSL.deleteFrom(DSL.table(FIELD_MASKING_TABLE))
            .where(DSL.field("dataset_field_id").eq(datasetFieldId));

        return jooqReactiveOperations.mono(deleteQuery).then();
    }
}
