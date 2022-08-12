package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataQualityTestRelationsPojo;
import org.springframework.stereotype.Repository;

import static org.opendatadiscovery.oddplatform.model.Tables.DATA_QUALITY_TEST_RELATIONS;

@Repository
@RequiredArgsConstructor
public class DataQualityTestRelationRepositoryImpl implements DataQualityTestRelationRepository {
    private final DSLContext dslContext;

    @Override
    public List<DataQualityTestRelationsPojo> getRelations(final Collection<String> dataQATestOddrns) {
        return dslContext.selectFrom(DATA_QUALITY_TEST_RELATIONS)
            .where(DATA_QUALITY_TEST_RELATIONS.DATA_QUALITY_TEST_ODDRN.in(dataQATestOddrns))
            .fetchStreamInto(DataQualityTestRelationsPojo.class)
            .toList();
    }
}
