package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.InsertValuesStep2;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataQualityTestRelationsPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DataQualityTestRelationsRecord;
import org.springframework.stereotype.Repository;

import static org.opendatadiscovery.oddplatform.model.Tables.DATA_QUALITY_TEST_RELATIONS;

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

    @Override
    public List<DataQualityTestRelationsPojo> getRelations(final Collection<String> dataQATestOddrns) {
        return dslContext.selectFrom(DATA_QUALITY_TEST_RELATIONS)
            .where(DATA_QUALITY_TEST_RELATIONS.DATA_QUALITY_TEST_ODDRN.in(dataQATestOddrns))
            .fetchStreamInto(DataQualityTestRelationsPojo.class)
            .toList();
    }
}
