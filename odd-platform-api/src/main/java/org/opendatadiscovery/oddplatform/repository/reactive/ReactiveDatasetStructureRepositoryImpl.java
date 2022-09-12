package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetStructurePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DatasetStructureRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_STRUCTURE;

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

        final LocalDateTime now = LocalDateTime.now();

        final List<DatasetStructureRecord> records = entities.stream()
            .map(e -> createRecord(e, now))
            .toList();

        return insertMany(records, true);
    }
}
