package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import com.provectus.oddplatform.model.tables.records.DataEntityTaskRunRecord;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Table;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.provectus.oddplatform.model.Tables.DATA_ENTITY_TASK_RUN;
import static java.util.function.Function.identity;

@Repository
public class DataEntityTaskRunRepositoryImpl
    extends AbstractCRUDRepository<DataEntityTaskRunRecord, DataEntityTaskRunPojo>
    implements DataEntityTaskRunRepository {

    public DataEntityTaskRunRepositoryImpl(final DSLContext dslContext) {
        super(dslContext, DATA_ENTITY_TASK_RUN, DATA_ENTITY_TASK_RUN.ID,
            DATA_ENTITY_TASK_RUN.NAME, DataEntityTaskRunPojo.class);
    }

    @Override
    @Transactional
    public void persist(final DataEntityTaskRunPojo pojo) {
        dslContext.selectFrom(DATA_ENTITY_TASK_RUN)
            .where(DATA_ENTITY_TASK_RUN.ODDRN.eq(pojo.getOddrn()))
            .fetchOptionalInto(DataEntityTaskRunPojo.class)
            .map(r -> {
                pojo.setId(r.getId());
                return pojo;
            })
            .ifPresentOrElse(this::update, () -> create(pojo));
    }

    @Override
    @Transactional
    public void persist(final Collection<DataEntityTaskRunPojo> pojos) {
        final Set<String> oddrns = pojos.stream()
            .map(DataEntityTaskRunPojo::getOddrn)
            .collect(Collectors.toSet());

        final Map<String, DataEntityTaskRunPojo> dict = dslContext.selectFrom(DATA_ENTITY_TASK_RUN)
            .where(DATA_ENTITY_TASK_RUN.ODDRN.in(oddrns))
            .fetchStreamInto(DataEntityTaskRunPojo.class)
            .collect(Collectors.toMap(DataEntityTaskRunPojo::getOddrn, identity()));

        final Map<Boolean, List<DataEntityTaskRunPojo>> partitioned = pojos.stream()
            .collect(Collectors.partitioningBy(p -> dict.containsKey(p.getOddrn())));

        bulkCreate(partitioned.get(false));
        bulkUpdate(partitioned.get(true));
    }
}
