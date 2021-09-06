package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.DataQualityTestRelationsPojo;
import com.provectus.oddplatform.model.tables.records.DataQualityTestRelationsRecord;
import java.util.Collection;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.InsertValuesStep2;
import org.springframework.stereotype.Repository;

import static com.provectus.oddplatform.model.Tables.DATA_QUALITY_TEST_RELATIONS;

@Repository
@RequiredArgsConstructor
public class DataQualityTestRelationRepositoryImpl implements DataQualityTestRelationRepository {
    private final DSLContext dslContext;

    @Override
    public void createRelations(final Collection<DataQualityTestRelationsPojo> pojos) {
        InsertValuesStep2<DataQualityTestRelationsRecord, String, String> step = dslContext.insertInto(
                DATA_QUALITY_TEST_RELATIONS,
                DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN,
                DATA_QUALITY_TEST_RELATIONS.DATA_QUALITY_TEST_ODDRN
        );

        for (final DataQualityTestRelationsPojo p : pojos) {
            step = step.values(p.getDatasetOddrn(), p.getDataQualityTestOddrn());
        }

        step.onDuplicateKeyIgnore().execute();
    }
}
