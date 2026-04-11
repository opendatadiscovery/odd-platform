package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetStructurePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DatasetStructureRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_STRUCTURE;
import static org.opendatadiscovery.oddplatform.model.Tables.LOOKUP_TABLES_DEFINITIONS;

@Slf4j
@Repository
public class ReactiveDatasetStructureRepositoryImpl
    extends ReactiveAbstractCRUDRepository<DatasetStructureRecord, DatasetStructurePojo>
    implements ReactiveDatasetStructureRepository {

    public ReactiveDatasetStructureRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                                  final JooqQueryHelper jooqQueryHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, DATASET_STRUCTURE, DatasetStructurePojo.class);
    }

    @Override
    public Mono<Void> bulkCreateHeadless(final List<DatasetStructurePojo> entities) {
        if (entities.isEmpty()) {
            return Mono.empty();
        }

        final LocalDateTime now = DateTimeUtil.generateNow();

        final List<DatasetStructureRecord> records = entities.stream()
            .map(e -> createRecord(e, now))
            .toList();

        return insertMany(records, true);
    }

    @Override
    public Mono<Void> deleteStructureByVersionIds(final Set<Long> versionsIds) {
        return jooqReactiveOperations.mono(DSL.deleteFrom(DATASET_STRUCTURE)
                .where(DATASET_STRUCTURE.DATASET_VERSION_ID.in(versionsIds)))
            .then(Mono.empty());
    }
}
