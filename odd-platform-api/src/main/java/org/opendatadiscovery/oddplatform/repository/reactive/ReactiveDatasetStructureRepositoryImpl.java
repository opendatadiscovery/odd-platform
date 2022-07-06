package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.jooq.InsertResultStep;
import org.jooq.InsertSetStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetStructurePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DatasetStructureRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_STRUCTURE;

@Slf4j
@Repository
public class ReactiveDatasetStructureRepositoryImpl implements ReactiveDatasetStructureRepository {

    private final JooqReactiveOperations jooqReactiveOperations;

    public ReactiveDatasetStructureRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations) {
        this.jooqReactiveOperations = jooqReactiveOperations;
    }

    @Override
    public Mono<List<DatasetStructurePojo>> bulkCreate(final List<DatasetStructurePojo> entities) {
        if (entities.isEmpty()) {
            return Mono.empty();
        }

        final List<DatasetStructureRecord> records = entities.stream()
            .map(e -> jooqReactiveOperations.newRecord(DATASET_STRUCTURE, e))
            .toList();

        InsertSetStep<DatasetStructureRecord> insertStep = DSL.insertInto(DATASET_STRUCTURE);

        for (int i = 0; i < records.size() - 1; i++) {
            insertStep = insertStep.set(records.get(i)).newRecord();
        }

        final InsertResultStep<DatasetStructureRecord> insertStepWithReturning = insertStep
            .set(records.get(records.size() - 1))
            .returning(DATASET_STRUCTURE.fields());
        return jooqReactiveOperations.flux(insertStepWithReturning)
            .map(r -> r.into(DatasetStructurePojo.class))
            .collect(Collectors.toList());
    }
}
