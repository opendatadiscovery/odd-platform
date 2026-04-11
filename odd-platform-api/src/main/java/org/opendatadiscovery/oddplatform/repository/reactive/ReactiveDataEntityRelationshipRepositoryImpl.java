package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.ResultQuery;
import org.jooq.Select;
import org.jooq.SortOrder;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.api.contract.model.RelationshipsType;
import org.opendatadiscovery.oddplatform.dto.RelationshipDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DataEntityRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.DataSourceRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.NamespaceRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.RelationshipsRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.OrderByField;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_RELATIONSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.RELATIONSHIPS;

@Slf4j
@Repository
@RequiredArgsConstructor
public class ReactiveDataEntityRelationshipRepositoryImpl
    implements ReactiveDataEntityRelationshipRepository {
    private static final String RELATIONSHIPS_CTE = "relationships_cte";
    private static final String SOURCE_DATA_ENTITY = "source_data_entity";
    private static final String TARGET_DATA_ENTITY = "target_data_entity";
    private static final String RELATIONSHIP_NAMESPACE = "relationship_namespace";
    private static final String DATA_SOURCE_NAMESPACE = "data_source_namespace";
    private static final String DATA_SOURCE_CTE = "data_source_cte";

    private final JooqReactiveOperations jooqReactiveOperations;
    private final JooqQueryHelper jooqQueryHelper;

    @Override
    public Mono<Page<RelationshipDto>> getRelationships(final Integer page, final Integer size,
                                                        final String inputQuery, final RelationshipsType type) {
        final Table<RelationshipsRecord> relationships = RELATIONSHIPS.asTable(RELATIONSHIPS_CTE);
        final Table<DataEntityRecord> srcDataEntity = DATA_ENTITY.asTable(SOURCE_DATA_ENTITY);
        final Table<DataEntityRecord> trgtDataEntity = DATA_ENTITY.asTable(TARGET_DATA_ENTITY);
        final Table<DataSourceRecord> dataSource = DATA_SOURCE.asTable(DATA_SOURCE_CTE);
        final Table<NamespaceRecord> relationshipNamespace = NAMESPACE.asTable(RELATIONSHIP_NAMESPACE);
        final Table<NamespaceRecord> dataSourceNamespace = NAMESPACE.asTable(DATA_SOURCE_NAMESPACE);

        final List<Condition> conditionList = new ArrayList<>();

        if (!StringUtils.isBlank(inputQuery)) {
            conditionList.add(DATA_ENTITY.EXTERNAL_NAME.containsIgnoreCase(inputQuery));
        }

        conditionList.add(DATA_ENTITY.ENTITY_CLASS_IDS.eq(new Integer[] {DATA_RELATIONSHIP.getId()}));

        final Select<DataEntityRecord> homogeneousQuery = DSL.selectFrom(DATA_ENTITY)
            .where(conditionList);

        final Select<? extends Record> relationshipSelect =
            jooqQueryHelper.paginate(homogeneousQuery,
                List.of(new OrderByField(DATA_ENTITY.ID, SortOrder.ASC)), (page - 1) * size, size);

        final Table<? extends Record> relationshipsDataEntityCTE =
            relationshipSelect.asTable("data_entity_relationship_cte");

        final List<Field<?>> groupByFields =
            Stream.of(relationshipsDataEntityCTE.fields(), srcDataEntity.fields(),
                    trgtDataEntity.fields(), relationships.fields(), dataSource.fields(),
                    relationshipNamespace.fields(), dataSourceNamespace.fields())
                .flatMap(Arrays::stream)
                .toList();

        final ResultQuery<Record> resultQuery = DSL.with(relationshipsDataEntityCTE.getName())
            .as(relationshipSelect)
            .select(relationshipsDataEntityCTE.fields())
            .select(relationships.asterisk(), srcDataEntity.asterisk(), trgtDataEntity.asterisk(),
                dataSource.asterisk(), relationshipNamespace.asterisk(), dataSourceNamespace.asterisk())
            .from(relationshipsDataEntityCTE.getName())
            .join(relationships)
            .on(relationshipsDataEntityCTE.field(DATA_ENTITY.ID).eq(relationships.field(RELATIONSHIPS.DATA_ENTITY_ID))
                .and(RelationshipsType.ALL == type
                    ? DSL.noCondition()
                    : relationships.field(RELATIONSHIPS.RELATIONSHIP_TYPE).eq(type.getValue())))
            .leftJoin(srcDataEntity)
            .on(relationships.field(RELATIONSHIPS.SOURCE_DATASET_ODDRN).eq(srcDataEntity.field(DATA_ENTITY.ODDRN)))
            .leftJoin(trgtDataEntity)
            .on(relationships.field(RELATIONSHIPS.TARGET_DATASET_ODDRN).eq(trgtDataEntity.field(DATA_ENTITY.ODDRN)))
            .leftJoin(dataSource)
            .on(relationshipsDataEntityCTE.field(DATA_ENTITY.DATA_SOURCE_ID).eq(dataSource.field(DATA_SOURCE.ID)))
            .leftJoin(dataSourceNamespace)
            .on(dataSource.field(DATA_SOURCE.NAMESPACE_ID).eq(dataSourceNamespace.field(NAMESPACE.ID)))
            .leftJoin(relationshipNamespace)
            .on(relationshipsDataEntityCTE.field(DATA_ENTITY.NAMESPACE_ID)
                .eq(relationshipNamespace.field(NAMESPACE.ID)))
            .groupBy(groupByFields);

        return jooqReactiveOperations.flux(resultQuery)
            .collectList()
            .flatMap(record -> jooqQueryHelper.pageifyResult(
                record,
                r -> RelationshipDto.builder()
                    .relationshipPojo(r.into(relationships).into(RelationshipsPojo.class))
                    .dataEntityRelationship(r.into(relationshipsDataEntityCTE).into(DataEntityPojo.class))
                    .sourceDataEntity(r.into(srcDataEntity).into(DataEntityPojo.class))
                    .targetDataEntity(r.into(trgtDataEntity).into(DataEntityPojo.class))
                    .dataSourcePojo(r.into(dataSource).into(DataSourcePojo.class))
                    .dataSourceNamespacePojo(r.into(dataSourceNamespace).into(NamespacePojo.class))
                    .relationshipNamespacePojo(r.into(relationshipNamespace).into(NamespacePojo.class))
                    .build(),
                jooqReactiveOperations
                    .mono(DSL.selectCount().from(DATA_ENTITY).where(conditionList))
                    .map(r -> r.component1().longValue())));
    }
}
