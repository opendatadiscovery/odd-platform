package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.Select;
import org.jooq.SelectOnConditionStep;
import org.jooq.SortOrder;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.dto.term.TermDetailsDto;
import org.opendatadiscovery.oddplatform.dto.term.TermDto;
import org.opendatadiscovery.oddplatform.dto.term.TermOwnershipDto;
import org.opendatadiscovery.oddplatform.dto.term.TermRefDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityToTermPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermOwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.TermRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqFTSHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.opendatadiscovery.oddplatform.repository.util.OrderByField;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static org.jooq.impl.DSL.countDistinct;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TO_TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.ROLE;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG_TO_TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM_OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM_SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConstants.RANK_FIELD_ALIAS;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConstants.TERM_CONDITIONS;

@Repository
public class ReactiveTermRepositoryImpl extends ReactiveAbstractSoftDeleteCRUDRepository<TermRecord, TermPojo>
    implements ReactiveTermRepository {

    private static final int SUGGESTION_LIMIT = 5;
    private static final String AGG_OWNERS_FIELD = "owners";
    private static final String AGG_OWNERSHIPS_FIELD = "ownerships";
    private static final String AGG_ROLES_FIELD = "roles";
    private static final String AGG_TAGS_FIELD = "tags";
    private static final String ENTITIES_COUNT = "entities_count";

    private final JooqRecordHelper jooqRecordHelper;
    private final JooqFTSHelper jooqFTSHelper;

    public ReactiveTermRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                      final JooqRecordHelper jooqRecordHelper,
                                      final JooqQueryHelper jooqQueryHelper,
                                      final JooqFTSHelper jooqFTSHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, TERM, TermPojo.class, TERM.NAME, TERM.ID,
            TERM.CREATED_AT, TERM.UPDATED_AT, TERM.IS_DELETED, TERM.DELETED_AT);
        this.jooqRecordHelper = jooqRecordHelper;
        this.jooqFTSHelper = jooqFTSHelper;
    }

    @Override
    public Mono<Page<TermRefDto>> listTermRefDtos(final int page, final int size, final String nameQuery) {
        final Select<TermRecord> homogeneousQuery = DSL.selectFrom(TERM)
            .where(listCondition(nameQuery));

        final Select<? extends Record> termSelect =
            paginate(homogeneousQuery, List.of(new OrderByField(TERM.ID, SortOrder.ASC)), (page - 1) * size, size);

        final Table<? extends Record> termCTE = termSelect.asTable("term_cte");

        final SelectOnConditionStep<Record> query = DSL.with(termCTE.getName())
            .as(termSelect)
            .select(termCTE.fields())
            .select(NAMESPACE.asterisk())
            .from(termCTE.getName())
            .join(NAMESPACE).on(NAMESPACE.ID.eq(termCTE.field(TERM.NAMESPACE_ID)));

        return jooqReactiveOperations.flux(query)
            .collectList()
            .flatMap(records -> jooqQueryHelper.pageifyResult(
                records,
                r -> mapRecordToRefDto(r, termCTE.getName()),
                fetchCount(nameQuery)
            ));
    }

    @Override
    public Mono<Boolean> existsByNamespace(final Long namespaceId) {
        final Select<? extends Record1<Boolean>> query = jooqQueryHelper.selectExists(
            DSL.select()
                .from(TERM)
                .join(NAMESPACE).on(NAMESPACE.ID.eq(TERM.NAMESPACE_ID))
                .where(TERM.IS_DELETED.isFalse())
                .and(NAMESPACE.ID.eq(namespaceId))
        );
        return jooqReactiveOperations.mono(query).map(Record1::component1);
    }

    @Override
    public Mono<Boolean> existsByNameAndNamespace(final String name, final String namespaceName) {
        final Select<? extends Record1<Boolean>> query = jooqQueryHelper.selectExists(
            DSL.select()
                .from(TERM)
                .join(NAMESPACE).on(NAMESPACE.ID.eq(TERM.NAMESPACE_ID))
                .where(TERM.NAME.eq(name).and(TERM.IS_DELETED.isFalse())
                    .and(NAMESPACE.NAME.eq(namespaceName)))
        );
        return jooqReactiveOperations.mono(query).map(Record1::component1);
    }

    @Override
    public Mono<TermRefDto> getTermRefDto(final Long id) {
        final var query = DSL
            .select(TERM.fields())
            .select(NAMESPACE.fields())
            .from(TERM)
            .join(NAMESPACE).on(NAMESPACE.ID.eq(TERM.NAMESPACE_ID))
            .where(TERM.ID.eq(id).and(TERM.IS_DELETED.isFalse()));
        return jooqReactiveOperations.mono(query)
            .map(this::mapRecordToRefDto);
    }

    @Override
    public Mono<TermDetailsDto> getTermDetailsDto(final Long id) {
        final List<Field<?>> groupByFields = Stream.of(TERM.fields(), NAMESPACE.fields())
            .flatMap(Arrays::stream)
            .toList();
        final var query = DSL
            .select(TERM.fields())
            .select(NAMESPACE.fields())
            .select(jsonArrayAgg(field(TERM_OWNERSHIP.asterisk().toString())).as(AGG_OWNERSHIPS_FIELD))
            .select(jsonArrayAgg(field(OWNER.asterisk().toString())).as(AGG_OWNERS_FIELD))
            .select(jsonArrayAgg(field(ROLE.asterisk().toString())).as(AGG_ROLES_FIELD))
            .select(jsonArrayAgg(field(TAG.asterisk().toString())).as(AGG_TAGS_FIELD))
            .select(DSL.countDistinct(DATA_ENTITY_TO_TERM.DATA_ENTITY_ID).as(ENTITIES_COUNT))
            .from(TERM)
            .join(NAMESPACE).on(NAMESPACE.ID.eq(TERM.NAMESPACE_ID))
            .leftJoin(TERM_OWNERSHIP).on(TERM_OWNERSHIP.TERM_ID.eq(TERM.ID).and(TERM_OWNERSHIP.DELETED_AT.isNull()))
            .leftJoin(OWNER).on(OWNER.ID.eq(TERM_OWNERSHIP.OWNER_ID))
            .leftJoin(ROLE).on(ROLE.ID.eq(TERM_OWNERSHIP.ROLE_ID))
            .leftJoin(TAG_TO_TERM).on(TAG_TO_TERM.TERM_ID.eq(TERM.ID).and(TAG_TO_TERM.DELETED_AT.isNull()))
            .leftJoin(TAG).on(TAG_TO_TERM.TAG_ID.eq(TAG.ID))
            .leftJoin(DATA_ENTITY_TO_TERM).on(DATA_ENTITY_TO_TERM.TERM_ID.eq(TERM.ID)
                .and(DATA_ENTITY_TO_TERM.DELETED_AT.isNull()))
            .where(TERM.ID.eq(id).and(TERM.IS_DELETED.isFalse()))
            .groupBy(groupByFields);
        return jooqReactiveOperations.mono(query)
            .map(this::mapRecordToDetailsDto);
    }

    @Override
    public Flux<DataEntityToTermPojo> deleteRelationsWithTerms(final Long dataEntityId) {
        final var query = DSL.update(DATA_ENTITY_TO_TERM)
            .set(DATA_ENTITY_TO_TERM.DELETED_AT, LocalDateTime.now())
            .where(DATA_ENTITY_TO_TERM.DATA_ENTITY_ID.eq(dataEntityId))
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(DataEntityToTermPojo.class));
    }

    @Override
    public Flux<DataEntityToTermPojo> deleteRelationsWithDataEntities(final Long termId) {
        final var query = DSL.update(DATA_ENTITY_TO_TERM)
            .set(DATA_ENTITY_TO_TERM.DELETED_AT, LocalDateTime.now())
            .where(DATA_ENTITY_TO_TERM.TERM_ID.eq(termId))
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(DataEntityToTermPojo.class));
    }

    @Override
    public Mono<DataEntityToTermPojo> createRelationWithDataEntity(final Long dataEntityId, final Long termId) {
        final var query = DSL.insertInto(DATA_ENTITY_TO_TERM)
            .set(DATA_ENTITY_TO_TERM.DATA_ENTITY_ID, dataEntityId)
            .set(DATA_ENTITY_TO_TERM.TERM_ID, termId)
            .onDuplicateKeyUpdate()
            .setNull(DATA_ENTITY_TO_TERM.DELETED_AT)
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(DataEntityToTermPojo.class));
    }

    @Override
    public Mono<DataEntityToTermPojo> deleteRelationWithDataEntity(final Long dataEntityId, final Long termId) {
        final var query = DSL.update(DATA_ENTITY_TO_TERM)
            .set(DATA_ENTITY_TO_TERM.DELETED_AT, LocalDateTime.now())
            .where(DATA_ENTITY_TO_TERM.DATA_ENTITY_ID.eq(dataEntityId).and(DATA_ENTITY_TO_TERM.TERM_ID.eq(termId)))
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(DataEntityToTermPojo.class));
    }

    @Override
    public Mono<Page<TermRefDto>> getQuerySuggestions(final String query) {
        if (StringUtils.isEmpty(query)) {
            return Mono.empty();
        }

        final Field<?> rankField = jooqFTSHelper.ftsRankField(TERM_SEARCH_ENTRYPOINT.SEARCH_VECTOR, query);
        final Field<Object> rankFieldAlias = field("rank", Object.class);

        final var select = DSL
            .select(TERM.fields())
            .select(NAMESPACE.fields())
            .select(rankField.as(rankFieldAlias))
            .from(TERM_SEARCH_ENTRYPOINT)
            .join(TERM).on(TERM.ID.eq(TERM_SEARCH_ENTRYPOINT.TERM_ID))
            .join(NAMESPACE).on(TERM.NAMESPACE_ID.eq(NAMESPACE.ID))
            .where(jooqFTSHelper.ftsCondition(TERM_SEARCH_ENTRYPOINT.SEARCH_VECTOR, query))
            .and(TERM.IS_DELETED.isFalse())
            .orderBy(rankFieldAlias.desc())
            .limit(SUGGESTION_LIMIT);

        return jooqReactiveOperations.flux(select)
            .map(this::mapRecordToRefDto)
            .collectList()
            .map(terms -> Page.<TermRefDto>builder()
                .data(terms)
                .total(terms.size())
                .hasNext(false)
                .build());
    }

    @Override
    public Mono<Page<TermDto>> findByState(final FacetStateDto state, final int page, final int size) {
        final List<Field<?>> selectFields = new ArrayList<>(
            Arrays.stream(TERM.fields()).toList()
        );

        final List<Condition> conditions = new ArrayList<>();
        conditions.addAll(jooqFTSHelper.facetStateConditions(state, TERM_CONDITIONS));
        conditions.add(TERM.IS_DELETED.isFalse());

        final List<OrderByField> orderFields = new ArrayList<>();
        if (StringUtils.isNotEmpty(state.getQuery())) {
            final Field<?> rankField = jooqFTSHelper.ftsRankField(
                TERM_SEARCH_ENTRYPOINT.SEARCH_VECTOR,
                state.getQuery()
            );

            selectFields.add(rankField.as(RANK_FIELD_ALIAS));
            conditions.add(jooqFTSHelper.ftsCondition(TERM_SEARCH_ENTRYPOINT.SEARCH_VECTOR, state.getQuery()));
            orderFields.add(new OrderByField(RANK_FIELD_ALIAS, SortOrder.DESC));
        }
        orderFields.add(new OrderByField(TERM.ID, SortOrder.ASC));

        final var baseQuery = DSL.select(selectFields)
            .from(TERM);
        if (StringUtils.isNotEmpty(state.getQuery())) {
            baseQuery.join(TERM_SEARCH_ENTRYPOINT).on(TERM_SEARCH_ENTRYPOINT.TERM_ID.eq(TERM.ID));
        }
        if (state.getState().get(FacetType.NAMESPACES) != null) {
            baseQuery.join(NAMESPACE).on(NAMESPACE.ID.eq(TERM.NAMESPACE_ID));
        }
        if (state.getState().get(FacetType.TAGS) != null) {
            baseQuery.leftJoin(TAG_TO_TERM).on(TAG_TO_TERM.TERM_ID.eq(TERM.ID).and(TAG_TO_TERM.DELETED_AT.isNull()))
                .leftJoin(TAG).on(TAG_TO_TERM.TAG_ID.eq(TAG.ID));
        }
        if (state.getState().get(FacetType.OWNERS) != null) {
            baseQuery.leftJoin(TERM_OWNERSHIP)
                .on(TERM_OWNERSHIP.TERM_ID.eq(TERM.ID).and(TERM_OWNERSHIP.DELETED_AT.isNull()))
                .leftJoin(OWNER).on(OWNER.ID.eq(TERM_OWNERSHIP.OWNER_ID));
        }
        baseQuery
            .where(conditions)
            .groupBy(selectFields);

        final Select<? extends Record> termSelect =
            paginate(baseQuery, orderFields, (page - 1) * size, size);

        final Table<? extends Record> termCTE = termSelect.asTable("term_cte");

        final List<Field<?>> groupByFields = Stream.of(termCTE.fields(), NAMESPACE.fields())
            .flatMap(Arrays::stream)
            .toList();

        final var query = DSL.with(termCTE.getName())
            .as(termSelect)
            .select(termCTE.fields())
            .select(NAMESPACE.fields())
            .select(jsonArrayAgg(field(TERM_OWNERSHIP.asterisk().toString())).as(AGG_OWNERSHIPS_FIELD))
            .select(jsonArrayAgg(field(OWNER.asterisk().toString())).as(AGG_OWNERS_FIELD))
            .select(jsonArrayAgg(field(ROLE.asterisk().toString())).as(AGG_ROLES_FIELD))
            .select(DSL.countDistinct(DATA_ENTITY_TO_TERM.DATA_ENTITY_ID).as(ENTITIES_COUNT))
            .from(termCTE.getName())
            .join(NAMESPACE).on(NAMESPACE.ID.eq(termCTE.field(TERM.NAMESPACE_ID)))
            .leftJoin(TERM_OWNERSHIP).on(TERM_OWNERSHIP.TERM_ID.eq(termCTE.field(TERM.ID))
                .and(TERM_OWNERSHIP.DELETED_AT.isNull()))
            .leftJoin(OWNER).on(OWNER.ID.eq(TERM_OWNERSHIP.OWNER_ID))
            .leftJoin(ROLE).on(ROLE.ID.eq(TERM_OWNERSHIP.ROLE_ID))
            .leftJoin(DATA_ENTITY_TO_TERM).on(DATA_ENTITY_TO_TERM.TERM_ID.eq(termCTE.field(TERM.ID))
                .and(DATA_ENTITY_TO_TERM.DELETED_AT.isNull()))
            .groupBy(groupByFields);

        return jooqReactiveOperations.flux(query)
            .collectList()
            .flatMap(records -> jooqQueryHelper.pageifyResult(
                records,
                r -> mapRecordToDto(r, termCTE.getName()),
                countByState(state)
            ));
    }

    @Override
    public Mono<Long> countByState(final FacetStateDto state) {
        var query = DSL.select(countDistinct(TERM.ID))
            .from(TERM)
            .join(TERM_SEARCH_ENTRYPOINT).on(TERM_SEARCH_ENTRYPOINT.TERM_ID.eq(TERM.ID))
            .leftJoin(TAG_TO_TERM).on(TAG_TO_TERM.TERM_ID.eq(TERM.ID).and(TAG_TO_TERM.DELETED_AT.isNull()))
            .leftJoin(TAG).on(TAG_TO_TERM.TAG_ID.eq(TAG.ID))
            .leftJoin(TERM_OWNERSHIP).on(TERM_OWNERSHIP.TERM_ID.eq(TERM.ID).and(TERM_OWNERSHIP.DELETED_AT.isNull()))
            .leftJoin(OWNER).on(TERM_OWNERSHIP.OWNER_ID.eq(OWNER.ID))
            .where(jooqFTSHelper.facetStateConditions(state, TERM_CONDITIONS))
            .and(TERM.IS_DELETED.isFalse());

        if (StringUtils.isNotEmpty(state.getQuery())) {
            query = query.and(jooqFTSHelper.ftsCondition(TERM_SEARCH_ENTRYPOINT.SEARCH_VECTOR, state.getQuery()));
        }

        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(Long.class));
    }

    @Override
    public Flux<TermRefDto> getDataEntityTerms(final long dataEntityId) {
        final var query = DSL
            .select(TERM.fields())
            .select(NAMESPACE.fields())
            .from(TERM)
            .join(NAMESPACE).on(NAMESPACE.ID.eq(TERM.NAMESPACE_ID))
            .join(DATA_ENTITY_TO_TERM)
            .on(DATA_ENTITY_TO_TERM.TERM_ID.eq(TERM.ID).and(DATA_ENTITY_TO_TERM.DELETED_AT.isNull())
                .and(DATA_ENTITY_TO_TERM.DATA_ENTITY_ID.eq(dataEntityId)))
            .where(TERM.IS_DELETED.isFalse());
        return jooqReactiveOperations.flux(query)
            .map(this::mapRecordToRefDto);
    }

    private TermRefDto mapRecordToRefDto(final Record record) {
        return TermRefDto.builder()
            .term(record.into(TERM).into(TermPojo.class))
            .namespace(record.into(NAMESPACE).into(NamespacePojo.class))
            .build();
    }

    private TermRefDto mapRecordToRefDto(final Record record, final String termCteName) {
        return TermRefDto.builder()
            .term(jooqRecordHelper.remapCte(record, termCteName, TERM).into(TermPojo.class))
            .namespace(record.into(NAMESPACE).into(NamespacePojo.class))
            .build();
    }

    private TermDto mapRecordToDto(final Record record) {
        final TermRefDto refDto = mapRecordToRefDto(record);
        return TermDto.builder()
            .termRefDto(refDto)
            .entitiesUsingCount(record.get(ENTITIES_COUNT, Integer.class))
            .ownerships(extractOwnershipRelation(record))
            .build();
    }

    private TermDto mapRecordToDto(final Record record, final String cteName) {
        final TermRefDto refDto = mapRecordToRefDto(record, cteName);
        return TermDto.builder()
            .termRefDto(refDto)
            .entitiesUsingCount(record.get(ENTITIES_COUNT, Integer.class))
            .ownerships(extractOwnershipRelation(record))
            .build();
    }

    private TermDetailsDto mapRecordToDetailsDto(final Record record) {
        final var termDto = mapRecordToDto(record);
        return TermDetailsDto.builder()
            .termDto(termDto)
            .tags(jooqRecordHelper.extractAggRelation(record, AGG_TAGS_FIELD, TagPojo.class))
            .build();
    }

    private Set<TermOwnershipDto> extractOwnershipRelation(final Record r) {
        final Map<Long, OwnerPojo> ownerDict = jooqRecordHelper.extractAggRelation(r, AGG_OWNERS_FIELD, OwnerPojo.class)
            .stream()
            .collect(Collectors.toMap(OwnerPojo::getId, identity()));

        final Map<Long, RolePojo> roleDict = jooqRecordHelper.extractAggRelation(r, AGG_ROLES_FIELD, RolePojo.class)
            .stream()
            .collect(Collectors.toMap(RolePojo::getId, identity()));

        return jooqRecordHelper.extractAggRelation(r, AGG_OWNERSHIPS_FIELD, TermOwnershipPojo.class)
            .stream()
            .map(os -> {
                final OwnerPojo owner = ownerDict.get(os.getOwnerId());
                if (owner == null) {
                    throw new IllegalArgumentException(
                        String.format("There's no owner with id %s found in ownerDict", os.getOwnerId()));
                }

                final RolePojo role = roleDict.get(os.getRoleId());
                if (role == null) {
                    throw new IllegalArgumentException(
                        String.format("There's no role with id %s found in roleDict", os.getRoleId()));
                }

                return new TermOwnershipDto(os, owner, role);
            })
            .collect(Collectors.toSet());
    }
}
