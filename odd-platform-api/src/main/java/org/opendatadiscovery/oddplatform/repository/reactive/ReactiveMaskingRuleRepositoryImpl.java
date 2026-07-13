package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.masking.MaskingRuleDto;
import org.opendatadiscovery.oddplatform.dto.masking.MaskingRuleType;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

@Repository
@RequiredArgsConstructor
public class ReactiveMaskingRuleRepositoryImpl implements ReactiveMaskingRuleRepository {
    private static final String MASKING_RULE_TABLE = "masking_rule";

    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Mono<List<MaskingRuleDto>> findAll() {
        final var query = DSL.select(
                DSL.field("id", Long.class),
                DSL.field("name", String.class),
                DSL.field("type", String.class),
                DSL.field("replacement", String.class),
                DSL.field("pattern", String.class)
            )
            .from(DSL.table(MASKING_RULE_TABLE))
            .where(DSL.field("is_deleted").eq(false));

        return jooqReactiveOperations.flux(query)
            .map(r -> MaskingRuleDto.builder()
                .id(r.component1())
                .name(r.component2())
                .type(MaskingRuleType.valueOf(r.component3()))
                .replacement(r.component4())
                .pattern(r.component5())
                .build())
            .collectList();
    }

    @Override
    public Mono<MaskingRuleDto> getById(final long id) {
        final var query = DSL.select(
                DSL.field("id", Long.class),
                DSL.field("name", String.class),
                DSL.field("type", String.class),
                DSL.field("replacement", String.class),
                DSL.field("pattern", String.class)
            )
            .from(DSL.table(MASKING_RULE_TABLE))
            .where(DSL.field("id").eq(id))
            .and(DSL.field("is_deleted").eq(false));

        return jooqReactiveOperations.mono(query)
            .map(r -> MaskingRuleDto.builder()
                .id(r.component1())
                .name(r.component2())
                .type(MaskingRuleType.valueOf(r.component3()))
                .replacement(r.component4())
                .pattern(r.component5())
                .build());
    }
}
