package org.opendatadiscovery.oddplatform.repository.util;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.ListUtils;
import org.jooq.Field;
import org.jooq.Name;
import org.jooq.OrderField;
import org.jooq.Record;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.SelectHavingStep;
import org.jooq.SelectJoinStep;
import org.jooq.SelectLimitStep;
import org.jooq.SelectSelectStep;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.springframework.stereotype.Component;

import static java.util.stream.Collectors.toList;
import static org.jooq.impl.DSL.exists;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.jooq.impl.DSL.name;
import static org.opendatadiscovery.oddplatform.model.Tables.ALERT;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TO_TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.ROLE;
import static org.opendatadiscovery.oddplatform.model.Tables.SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG_TO_DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.repository.util.DataEntityQueryConfig.AGG_OWNERSHIP_FIELD;
import static org.opendatadiscovery.oddplatform.repository.util.DataEntityQueryConfig.AGG_OWNER_FIELD;
import static org.opendatadiscovery.oddplatform.repository.util.DataEntityQueryConfig.AGG_ROLE_FIELD;
import static org.opendatadiscovery.oddplatform.repository.util.DataEntityQueryConfig.AGG_TAGS_FIELD;
import static org.opendatadiscovery.oddplatform.repository.util.DataEntityQueryConfig.AGG_TAGS_RELATION_FIELD;
import static org.opendatadiscovery.oddplatform.repository.util.DataEntityQueryConfig.DATA_ENTITY_CTE_NAME;
import static org.opendatadiscovery.oddplatform.repository.util.DataEntityQueryConfig.HAS_ALERTS_FIELD;

@Component
@RequiredArgsConstructor
// TODO: make a package 'query' for this class
public class DataEntityQueryBuilder {
    private final JooqQueryHelper jooqQueryHelper;
    private final JooqFTSHelper jooqFTSHelper;

    public SelectLimitStep<Record> dataEntitySelectQuery(final DataEntityQueryConfig config) {
        final Name deCteName = name(DATA_ENTITY_CTE_NAME);

        final Select<Record> dataEntitySelect = cteDataEntitySelect(config);
        final Table<Record> deCte = dataEntitySelect.asTable(deCteName);

        final List<Field<?>> selectFields = Stream
            .of(deCte.fields(), NAMESPACE.fields(), DATA_SOURCE.fields())
            .flatMap(Arrays::stream)
            .collect(toList());

        final Field<Boolean> hasAlertsField = field(exists(DSL.selectOne().from(ALERT)
            .where(ALERT.DATA_ENTITY_ODDRN.eq(deCte.field(DATA_ENTITY.ODDRN)))
            .and(ALERT.STATUS.eq(AlertStatusEnum.OPEN.toString())))).as(HAS_ALERTS_FIELD);

        SelectSelectStep<Record> selectStep = DSL.with(deCteName)
            .asMaterialized(dataEntitySelect)
            .select(selectFields);

        if (config.isDimensions()) {
            selectStep = selectStep
                .select(jsonArrayAgg(field(TAG_TO_DATA_ENTITY.asterisk().toString())).as(AGG_TAGS_RELATION_FIELD))
                .select(jsonArrayAgg(field(TAG.asterisk().toString())).as(AGG_TAGS_FIELD))
                .select(jsonArrayAgg(field(OWNER.asterisk().toString())).as(AGG_OWNER_FIELD))
                .select(jsonArrayAgg(field(ROLE.asterisk().toString())).as(AGG_ROLE_FIELD))
                .select(jsonArrayAgg(field(OWNERSHIP.asterisk().toString())).as(AGG_OWNERSHIP_FIELD))
                .select(hasAlertsField);
        }

        SelectJoinStep<Record> fromStep = selectStep.from(deCteName);

        if (config.isDimensions()) {
            // @formatter:off
            fromStep = fromStep
                .leftJoin(DATA_SOURCE)
                    .on(DATA_SOURCE.ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.DATA_SOURCE_ID)))
                .leftJoin(NAMESPACE)
                    .on(NAMESPACE.ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.NAMESPACE_ID)))
                    .or(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
                .leftJoin(TAG_TO_DATA_ENTITY)
                    .on(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.ID)))
                .leftJoin(TAG)
                    .on(TAG.ID.eq(TAG_TO_DATA_ENTITY.TAG_ID))
                .leftJoin(OWNERSHIP)
                    .on(OWNERSHIP.DATA_ENTITY_ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.ID)))
                .leftJoin(OWNER)
                    .on(OWNER.ID.eq(OWNERSHIP.OWNER_ID))
                .leftJoin(ROLE)
                    .on(ROLE.ID.eq(OWNERSHIP.ROLE_ID))
                .leftJoin(DATA_ENTITY_TO_TERM)
                    .on(DATA_ENTITY_TO_TERM.DATA_ENTITY_ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.ID)))
                    .and(DATA_ENTITY_TO_TERM.DELETED_AT.isNull());
            // @formatter:on
        }

        final SelectHavingStep<Record> groupByStep = fromStep
            .where(ListUtils.emptyIfNull(config.getSelectConditions()))
            .groupBy(selectFields);

        final List<OrderField<?>> orderFields = new ArrayList<>();
        if (config.getFts() != null) {
            orderFields.add(jooqQueryHelper.getField(deCte, config.getFts().rankFieldAlias()).desc());
        }
        orderFields.add(jooqQueryHelper.getField(deCte, DATA_ENTITY.ID).desc());

        return groupByStep.orderBy(orderFields);
    }

    private Select<Record> cteDataEntitySelect(final DataEntityQueryConfig config) {
        Select<Record> dataEntitySelect;

        final List<OrderField<?>> orderFields = new ArrayList<>();

        if (config.getFts() != null) {
            final Field<?> rankField = jooqFTSHelper.ftsRankField(
                SEARCH_ENTRYPOINT.SEARCH_VECTOR,
                config.getFts().query()
            );

            orderFields.add(config.getFts().rankFieldAlias().desc());

            dataEntitySelect = DSL
                .select(DATA_ENTITY.fields())
                .select(rankField.as(config.getFts().rankFieldAlias()))
                .from(SEARCH_ENTRYPOINT)
                .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(SEARCH_ENTRYPOINT.DATA_ENTITY_ID))
                .where(ListUtils.emptyIfNull(config.getCteSelectConditions()))
                .and(jooqFTSHelper.ftsCondition(SEARCH_ENTRYPOINT.SEARCH_VECTOR, config.getFts().query()))
                .and(DATA_ENTITY.DELETED_AT.isNull());
        } else {
            dataEntitySelect = DSL.select(DATA_ENTITY.fields())
                .from(DATA_ENTITY)
                .where(ListUtils.emptyIfNull(config.getCteSelectConditions()))
                .and(DATA_ENTITY.DELETED_AT.isNull());
        }

        if (!config.isIncludeHollow()) {
            dataEntitySelect = ((SelectConditionStep<Record>) dataEntitySelect)
                .and(DATA_ENTITY.HOLLOW.isFalse());
        }

        if (config.getOrderBy() != null) {
            orderFields.add(config.getOrderBy());
        }

        orderFields.add(DATA_ENTITY.ID.desc());

        dataEntitySelect = ((SelectConditionStep<Record>) dataEntitySelect).orderBy(orderFields);

        if (config.getCteLimitOffset() != null) {
            dataEntitySelect = ((SelectConditionStep<Record>) dataEntitySelect)
                .limit(config.getCteLimitOffset().limit())
                .offset(config.getCteLimitOffset().offset());
        }

        return dataEntitySelect;
    }
}
