package org.opendatadiscovery.oddplatform.repository;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.InsertSetStep;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetStructurePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DatasetStructureRecord;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_STRUCTURE;

@Repository
@RequiredArgsConstructor
public class DatasetStructureRepositoryImpl implements DatasetStructureRepository {
    private final DSLContext dslContext;
    private final DatasetFieldRepository datasetFieldRepository;
    private final DatasetVersionRepository datasetVersionRepository;

    @Override
    @Transactional
    public List<DatasetStructurePojo> bulkCreate(final List<DatasetVersionPojo> versions,
                                                 final Map<String, List<DatasetFieldPojo>> datasetFields) {
        final List<DatasetFieldPojo> fields = datasetFields.values().stream()
            .flatMap(List::stream)
            .collect(Collectors.toList());

        final List<DatasetVersionPojo> createdVersions = datasetVersionRepository.bulkCreate(versions);

        final Map<String, DatasetFieldPojo> createdDFMap = datasetFieldRepository.persist(fields)
            .stream()
            .collect(Collectors.toMap(DatasetFieldPojo::getOddrn, Function.identity()));

        final List<DatasetStructurePojo> structure = createdVersions.stream()
            .flatMap(v -> datasetFields.get(v.getDatasetOddrn()).stream()
                .map(f -> createdDFMap.get(f.getOddrn()))
                .map(DatasetFieldPojo::getId)
                .map(dfId -> new DatasetStructurePojo().setDatasetFieldId(dfId).setDatasetVersionId(v.getId())))
            .collect(Collectors.toList());

        return bulkInsert(structure);
    }

    protected List<DatasetStructurePojo> bulkInsert(final List<DatasetStructurePojo> entities) {
        if (entities.isEmpty()) {
            return Collections.emptyList();
        }

        final List<DatasetStructureRecord> records = entities.stream()
            .map(e -> dslContext.newRecord(DATASET_STRUCTURE, e))
            .collect(Collectors.toList());

        InsertSetStep<DatasetStructureRecord> insertStep = dslContext.insertInto(DATASET_STRUCTURE);

        for (int i = 0; i < records.size() - 1; i++) {
            insertStep = insertStep.set(records.get(i)).newRecord();
        }

        return insertStep
            .set(records.get(records.size() - 1))
            .returning(DATASET_STRUCTURE.fields())
            .fetch()
            .stream()
            .map(r -> r.into(DatasetStructurePojo.class))
            .collect(Collectors.toList());
    }
}
