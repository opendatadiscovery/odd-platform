package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.LineagePojo;
import com.provectus.oddplatform.model.tables.records.LineageRecord;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.InsertValuesStep2;
import org.springframework.stereotype.Repository;

import static com.provectus.oddplatform.model.Tables.DATA_ENTITY;
import static com.provectus.oddplatform.model.Tables.LINEAGE;

@Repository
@RequiredArgsConstructor
public class LineageRepositoryImpl implements LineageRepository {
    private final DSLContext dslContext;

    @Override
    public void createLineagePaths(final List<LineagePojo> pojos) {
        InsertValuesStep2<LineageRecord, String, String> step
            = dslContext.insertInto(LINEAGE, LINEAGE.PARENT_ODDRN, LINEAGE.CHILD_ODDRN);

        for (final LineagePojo p : pojos) {
            step = step.values(p.getParentOddrn(), p.getChildOddrn());
        }

        step.onDuplicateKeyIgnore().execute();
    }

    @Override
    public Optional<Long> getTargetsCount(final long dataEntityId) {
        return dslContext.selectCount()
            .from(LINEAGE)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(LINEAGE.PARENT_ODDRN))
            .where(DATA_ENTITY.ID.eq(dataEntityId))
            .fetchOptionalInto(Long.class);
    }
}
