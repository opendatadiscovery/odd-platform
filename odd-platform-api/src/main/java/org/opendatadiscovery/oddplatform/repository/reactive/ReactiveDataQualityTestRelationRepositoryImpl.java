package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataQualityTestRelationsPojo;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.DATA_QUALITY_TEST_RELATIONS;

@Repository
@RequiredArgsConstructor
public class ReactiveDataQualityTestRelationRepositoryImpl implements ReactiveDataQualityTestRelationRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Mono<Void> createRelations(final List<DataQualityTestRelationsPojo> pojos) {
        if (pojos.isEmpty()) {
            return Mono.empty();
        }

        return jooqReactiveOperations.executeInPartition(pojos, ps -> {
            var step = DSL.insertInto(
                DATA_QUALITY_TEST_RELATIONS,
                DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN,
                DATA_QUALITY_TEST_RELATIONS.DATA_QUALITY_TEST_ODDRN
            );

            for (final DataQualityTestRelationsPojo p : ps) {
                step = step.values(p.getDatasetOddrn(), p.getDataQualityTestOddrn());
            }

            return jooqReactiveOperations.mono(step.onDuplicateKeyIgnore());
        });
    }

    @Override
    public Flux<DataQualityTestRelationsPojo> getRelations(final Collection<String> dataQATestOddrns) {
        final var query = DSL
            .selectFrom(DATA_QUALITY_TEST_RELATIONS)
            .where(DATA_QUALITY_TEST_RELATIONS.DATA_QUALITY_TEST_ODDRN.in(dataQATestOddrns));

        return jooqReactiveOperations.flux(query).map(r -> r.into(DataQualityTestRelationsPojo.class));
    }
}
