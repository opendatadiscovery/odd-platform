package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.ListUtils;
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
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.dto.term.LinkedTermDto;
import org.opendatadiscovery.oddplatform.dto.term.TermBaseInfoDto;
import org.opendatadiscovery.oddplatform.dto.term.TermDetailsDto;
import org.opendatadiscovery.oddplatform.dto.term.TermDto;
import org.opendatadiscovery.oddplatform.dto.term.TermOwnershipDto;
import org.opendatadiscovery.oddplatform.dto.term.TermRefDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermOwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermToTermPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TitlePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.NamespaceRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.TermRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.TermToTermRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqFTSHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.opendatadiscovery.oddplatform.repository.util.OrderByField;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static org.jooq.impl.DSL.countDistinct;
import static org.jooq.impl.DSL.exists;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD_TO_TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_STRUCTURE;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_VERSION;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TO_TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.QUERY_EXAMPLE_TO_TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG_TO_TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM_OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM_SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM_TO_TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.TITLE;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConstants.RANK_FIELD_ALIAS;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConstants.TERM_CONDITIONS;

@Repository
public class ReactiveTermRepositoryImpl extends ReactiveAbstractSoftDeleteCRUDRepository<TermRecord, TermPojo>
    implements ReactiveTermRepository {

    private static final int SUGGESTION_LIMIT = 5;
    private static final String AGG_OWNERS_FIELD = "owners";
    private static final String AGG_OWNERSHIPS_FIELD = "ownerships";
    private static final String AGG_TITLES_FIELD = "titles";
    private static final String AGG_TAGS_FIELD = "tags";
    private static final String AGG_ASSIGNED_TERMS = "assigned_terms";
    public static final String ASSIGNED_TERM_NAMESPACES = "assigned_term_namespaces";
    public static final String ASSIGNED_TERM_RELATIONS = "assigned_term_relation";
    private static final String ENTITIES_COUNT = "entities_count";
    private static final String COLUMNS_COUNT = "columns_count";
    private static final String LINKED_TERMS_COUNT = "linked_terms_count";
    private static final String QUERY_EXAMPLE_COUNT = "query_example_count";
    private static final String IS_DESCRIPTION_LINK = "is_description_link";

    private final JooqRecordHelper jooqRecordHelper;
    private final JooqFTSHelper jooqFTSHelper;

    public ReactiveTermRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                      final JooqRecordHelper jooqRecordHelper,
                                      final JooqQueryHelper jooqQueryHelper,
                                      final JooqFTSHelper jooqFTSHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, TERM, TermPojo.class);
        this.jooqRecordHelper = jooqRecordHelper;
        this.jooqFTSHelper = jooqFTSHelper;
    }

    @Override
    public Mono<Page<TermRefDto>> listTermRefDtos(final int page, final int size, final String nameQuery,
                                                  final OffsetDateTime updatedAtRangeStartDateTime,
                                                  final OffsetDateTime updatedAtRangeEndDateTime) {
        final Select<TermRecord> homogeneousQuery = DSL.selectFrom(TERM)
            .where(ListUtils.union(listCondition(nameQuery),
                dateConditions(updatedAtRangeStartDateTime, updatedAtRangeEndDateTime)));

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
                .where(TERM.DELETED_AT.isNull())
                .and(NAMESPACE.ID.eq(namespaceId))
        );
        return jooqReactiveOperations.mono(query).map(Record1::component1);
    }

    @Override
    public Mono<TermRefDto> getByNameAndNamespace(final String namespaceName, final String name) {
        final var query = DSL
            .select(TERM.fields())
            .select(NAMESPACE.fields())
            .from(TERM)
            .join(NAMESPACE).on(NAMESPACE.ID.eq(TERM.NAMESPACE_ID))
            .where(TERM.NAME.equalIgnoreCase(name).and(TERM.DELETED_AT.isNull())
                .and(NAMESPACE.NAME.equalIgnoreCase(namespaceName)));
        return jooqReactiveOperations.mono(query).map(this::mapRecordToRefDto);
    }

    @Override
    public Mono<List<TermRefDto>> getByNameAndNamespace(final List<TermBaseInfoDto> termBaseInfoDtos) {
        if (CollectionUtils.isEmpty(termBaseInfoDtos)) {
            return Mono.just(List.of());
        }
        final Condition condition = termBaseInfoDtos.stream()
            .map(dto -> TERM.NAME.equalIgnoreCase(dto.name()).and(NAMESPACE.NAME.equalIgnoreCase(dto.namespaceName())))
            .reduce(Condition::or)
            .orElseThrow(() -> new IllegalArgumentException("Can't build condition for terms"));
        final var query = DSL.select(TERM.fields())
            .select(NAMESPACE.fields())
            .from(TERM)
            .join(NAMESPACE).on(NAMESPACE.ID.eq(TERM.NAMESPACE_ID))
            .where(condition)
            .and(TERM.DELETED_AT.isNull());
        return jooqReactiveOperations.flux(query)
            .map(this::mapRecordToRefDto)
            .collectList();
    }

    @Override
    public Mono<TermRefDto> getTermRefDto(final Long id) {
        final var query = DSL
            .select(TERM.fields())
            .select(NAMESPACE.fields())
            .from(TERM)
            .join(NAMESPACE).on(NAMESPACE.ID.eq(TERM.NAMESPACE_ID))
            .where(TERM.ID.eq(id).and(TERM.DELETED_AT.isNull()));
        return jooqReactiveOperations.mono(query)
            .map(this::mapRecordToRefDto);
    }

    @Override
    public Mono<TermDetailsDto> getTermDetailsDto(final Long id) {
        final Table<TermRecord> assignedTerms = TERM.asTable("assigned_terms");
        final Table<NamespaceRecord> assignedTermsNamespace = NAMESPACE.asTable("assigned_terms_namespace");
        final Table<TermToTermRecord> assignedTermRelations = TERM_TO_TERM.asTable("assigned_term_relations");
        final Table<TermToTermRecord> linkedTerms = TERM_TO_TERM.asTable("linked_terms");

        final List<Field<?>> groupByFields = Stream.of(TERM.fields(), NAMESPACE.fields())
            .flatMap(Arrays::stream)
            .toList();
        final var query = DSL
            .select(TERM.fields())
            .select(NAMESPACE.fields())
            .select(jsonArrayAgg(field(TERM_OWNERSHIP.asterisk().toString())).as(AGG_OWNERSHIPS_FIELD))
            .select(jsonArrayAgg(field(OWNER.asterisk().toString())).as(AGG_OWNERS_FIELD))
            .select(jsonArrayAgg(field(TITLE.asterisk().toString())).as(AGG_TITLES_FIELD))
            .select(jsonArrayAgg(field(TAG.asterisk().toString())).as(AGG_TAGS_FIELD))
            .select(jsonArrayAgg(field(assignedTerms.asterisk().toString())).as(AGG_ASSIGNED_TERMS))
            .select(jsonArrayAgg(field(NAMESPACE.asterisk().toString())).as(ASSIGNED_TERM_NAMESPACES))
            .select(jsonArrayAgg(field(assignedTermRelations.asterisk().toString())).as(ASSIGNED_TERM_RELATIONS))
            .select(DSL.countDistinct(DATA_ENTITY_TO_TERM.DATA_ENTITY_ID).as(ENTITIES_COUNT))
            .select(DSL.countDistinct(DATASET_FIELD_TO_TERM.DATASET_FIELD_ID).as(COLUMNS_COUNT))
            .select(DSL.countDistinct(QUERY_EXAMPLE_TO_TERM.QUERY_EXAMPLE_ID).as(QUERY_EXAMPLE_COUNT))
            .select(DSL.countDistinct(linkedTerms.field(TERM_TO_TERM.TARGET_TERM_ID)).as(LINKED_TERMS_COUNT))
            .from(TERM)
            .join(NAMESPACE).on(NAMESPACE.ID.eq(TERM.NAMESPACE_ID))
            .leftJoin(TERM_OWNERSHIP).on(TERM_OWNERSHIP.TERM_ID.eq(TERM.ID))
            .leftJoin(OWNER).on(OWNER.ID.eq(TERM_OWNERSHIP.OWNER_ID))
            .leftJoin(TITLE).on(TITLE.ID.eq(TERM_OWNERSHIP.TITLE_ID))
            .leftJoin(TAG_TO_TERM).on(TAG_TO_TERM.TERM_ID.eq(TERM.ID))
            .leftJoin(TAG).on(TAG_TO_TERM.TAG_ID.eq(TAG.ID))
            .leftJoin(DATA_ENTITY_TO_TERM).on(DATA_ENTITY_TO_TERM.TERM_ID.eq(TERM.ID))
            .leftJoin(DATASET_FIELD_TO_TERM).on(DATASET_FIELD_TO_TERM.TERM_ID.eq(TERM.ID))
            .leftJoin(QUERY_EXAMPLE_TO_TERM).on(QUERY_EXAMPLE_TO_TERM.TERM_ID.eq(TERM.ID))
            .leftJoin(linkedTerms).on(linkedTerms.field(TERM_TO_TERM.ASSIGNED_TERM_ID).eq(TERM.ID))
            .leftJoin(assignedTermRelations)
            .on(assignedTermRelations.field(TERM_TO_TERM.TARGET_TERM_ID).eq(TERM.ID))
            .leftJoin(assignedTerms)
            .on(assignedTerms.field(TERM.ID).eq(assignedTermRelations.field(TERM_TO_TERM.ASSIGNED_TERM_ID)))
            .leftJoin(assignedTermsNamespace)
            .on(assignedTerms.field(TERM.NAMESPACE_ID).eq(assignedTermsNamespace.field(NAMESPACE.ID)))
            .where(TERM.ID.eq(id).and(TERM.DELETED_AT.isNull()))
            .groupBy(groupByFields);
        return jooqReactiveOperations.mono(query)
            .map(this::mapRecordToDetailsDto);
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
            .and(TERM.DELETED_AT.isNull())
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
        conditions.add(TERM.DELETED_AT.isNull());

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
            baseQuery.leftJoin(TAG_TO_TERM).on(TAG_TO_TERM.TERM_ID.eq(TERM.ID))
                .leftJoin(TAG).on(TAG_TO_TERM.TAG_ID.eq(TAG.ID));
        }
        if (state.getState().get(FacetType.OWNERS) != null) {
            baseQuery.leftJoin(TERM_OWNERSHIP)
                .on(TERM_OWNERSHIP.TERM_ID.eq(TERM.ID))
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

        final Table<TermToTermRecord> linkedTerms = TERM_TO_TERM.asTable("linked_terms");

        final var query = DSL.with(termCTE.getName())
            .as(termSelect)
            .select(termCTE.fields())
            .select(NAMESPACE.fields())
            .select(jsonArrayAgg(field(TERM_OWNERSHIP.asterisk().toString())).as(AGG_OWNERSHIPS_FIELD))
            .select(jsonArrayAgg(field(OWNER.asterisk().toString())).as(AGG_OWNERS_FIELD))
            .select(jsonArrayAgg(field(TITLE.asterisk().toString())).as(AGG_TITLES_FIELD))
            .select(DSL.countDistinct(DATA_ENTITY_TO_TERM.DATA_ENTITY_ID).as(ENTITIES_COUNT))
            .select(DSL.countDistinct(DATASET_FIELD_TO_TERM.DATASET_FIELD_ID).as(COLUMNS_COUNT))
            .select(DSL.countDistinct(QUERY_EXAMPLE_TO_TERM.QUERY_EXAMPLE_ID).as(QUERY_EXAMPLE_COUNT))
            .select(DSL.countDistinct(linkedTerms.field(TERM_TO_TERM.TARGET_TERM_ID)).as(LINKED_TERMS_COUNT))
            .from(termCTE.getName())
            .join(NAMESPACE).on(NAMESPACE.ID.eq(termCTE.field(TERM.NAMESPACE_ID)))
            .leftJoin(TERM_OWNERSHIP).on(TERM_OWNERSHIP.TERM_ID.eq(termCTE.field(TERM.ID)))
            .leftJoin(OWNER).on(OWNER.ID.eq(TERM_OWNERSHIP.OWNER_ID))
            .leftJoin(TITLE).on(TITLE.ID.eq(TERM_OWNERSHIP.TITLE_ID))
            .leftJoin(DATA_ENTITY_TO_TERM).on(DATA_ENTITY_TO_TERM.TERM_ID.eq(termCTE.field(TERM.ID)))
            .leftJoin(DATASET_FIELD_TO_TERM).on(DATASET_FIELD_TO_TERM.TERM_ID.eq(termCTE.field(TERM.ID)))
            .leftJoin(QUERY_EXAMPLE_TO_TERM).on(QUERY_EXAMPLE_TO_TERM.TERM_ID.eq(termCTE.field(TERM.ID)))
            .leftJoin(linkedTerms).on(linkedTerms.field(TERM_TO_TERM.ASSIGNED_TERM_ID).eq(termCTE.field(TERM.ID)))
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
            .leftJoin(TAG_TO_TERM).on(TAG_TO_TERM.TERM_ID.eq(TERM.ID))
            .leftJoin(TAG).on(TAG_TO_TERM.TAG_ID.eq(TAG.ID))
            .leftJoin(TERM_OWNERSHIP).on(TERM_OWNERSHIP.TERM_ID.eq(TERM.ID))
            .leftJoin(OWNER).on(TERM_OWNERSHIP.OWNER_ID.eq(OWNER.ID))
            .where(jooqFTSHelper.facetStateConditions(state, TERM_CONDITIONS))
            .and(TERM.DELETED_AT.isNull());

        if (StringUtils.isNotEmpty(state.getQuery())) {
            query = query.and(jooqFTSHelper.ftsCondition(TERM_SEARCH_ENTRYPOINT.SEARCH_VECTOR, state.getQuery()));
        }

        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(Long.class));
    }

    @Override
    public Flux<LinkedTermDto> getDataEntityTerms(final long dataEntityId) {
        final var query = DSL
            .select(TERM.fields())
            .select(NAMESPACE.fields())
            .select(DATA_ENTITY_TO_TERM.IS_DESCRIPTION_LINK.as(IS_DESCRIPTION_LINK))
            .from(TERM)
            .join(NAMESPACE).on(NAMESPACE.ID.eq(TERM.NAMESPACE_ID))
            .join(DATA_ENTITY_TO_TERM)
            .on(DATA_ENTITY_TO_TERM.TERM_ID.eq(TERM.ID).and(DATA_ENTITY_TO_TERM.DATA_ENTITY_ID.eq(dataEntityId)))
            .where(TERM.DELETED_AT.isNull());
        return jooqReactiveOperations.flux(query)
            .map(this::mapRecordToLinkedTermDto);
    }

    @Override
    public Flux<LinkedTermDto> getDatasetFieldTerms(final long datasetFieldId) {
        final var query = DSL
            .select(TERM.fields())
            .select(NAMESPACE.fields())
            .select(DATASET_FIELD_TO_TERM.IS_DESCRIPTION_LINK.as(IS_DESCRIPTION_LINK))
            .from(TERM)
            .join(NAMESPACE).on(NAMESPACE.ID.eq(TERM.NAMESPACE_ID))
            .join(DATASET_FIELD_TO_TERM)
            .on(DATASET_FIELD_TO_TERM.TERM_ID.eq(TERM.ID)
                .and(DATASET_FIELD_TO_TERM.DATASET_FIELD_ID.eq(datasetFieldId)))
            .where(TERM.DELETED_AT.isNull());
        return jooqReactiveOperations.flux(query)
            .map(this::mapRecordToLinkedTermDto);
    }

    @Override
    public Mono<Boolean> hasDescriptionRelations(final long termId) {
        final Condition dataEntityDescriptionRelations = exists(DSL.selectOne()
            .from(DATA_ENTITY_TO_TERM)
            .join(DATA_ENTITY).on(DATA_ENTITY_TO_TERM.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .where(DATA_ENTITY_TO_TERM.TERM_ID.eq(termId)
                .and(DATA_ENTITY_TO_TERM.IS_DESCRIPTION_LINK.isTrue())
                .and(DATA_ENTITY.STATUS.ne(DataEntityStatusDto.DELETED.getId()))
            ));
        final Condition datasetFieldDescriptionRelations = exists(DSL.selectOne()
            .from(DATASET_FIELD_TO_TERM)
            .join(DATASET_FIELD).on(DATASET_FIELD_TO_TERM.DATASET_FIELD_ID.eq(DATASET_FIELD.ID))
            .join(DATASET_STRUCTURE).on(DATASET_FIELD.ID.eq(DATASET_STRUCTURE.DATASET_FIELD_ID))
            .join(DATASET_VERSION).on(DATASET_VERSION.ID.eq(DATASET_STRUCTURE.DATASET_VERSION_ID))
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATASET_VERSION.DATASET_ODDRN))
            .where(DATASET_FIELD_TO_TERM.TERM_ID.eq(termId)
                .and(DATASET_FIELD_TO_TERM.IS_DESCRIPTION_LINK.isTrue())
                .and(DATA_ENTITY.STATUS.ne(DataEntityStatusDto.DELETED.getId()))
            ));
        final Condition termDescriptionRelations = exists(DSL.selectOne()
            .from(TERM_TO_TERM)
            .join(TERM).on(TERM_TO_TERM.TARGET_TERM_ID.eq(TERM.ID))
            .where(TERM_TO_TERM.ASSIGNED_TERM_ID.eq(termId)
                .and(TERM_TO_TERM.IS_DESCRIPTION_LINK.isTrue())
                .and(TERM.DELETED_AT.isNull())
            ));
        final var query = DSL.select(dataEntityDescriptionRelations
            .or(datasetFieldDescriptionRelations)
            .or(termDescriptionRelations));
        return jooqReactiveOperations.mono(query).map(Record1::component1);
    }

    @Override
    public Flux<LinkedTermDto> getLinkedTermsByTargetTermId(final long targetTermId) {
        final var query = DSL
            .select(TERM.fields())
            .select(NAMESPACE.fields())
            .select(TERM_TO_TERM.IS_DESCRIPTION_LINK.as(IS_DESCRIPTION_LINK))
            .from(TERM)
            .join(NAMESPACE).on(NAMESPACE.ID.eq(TERM.NAMESPACE_ID))
            .join(TERM_TO_TERM)
            .on(TERM_TO_TERM.ASSIGNED_TERM_ID.eq(TERM.ID)
                .and(TERM_TO_TERM.TARGET_TERM_ID.eq(targetTermId)))
            .where(TERM.DELETED_AT.isNull());
        return jooqReactiveOperations.flux(query)
            .map(this::mapRecordToLinkedTermDto);
    }

    @Override
    public Flux<LinkedTermDto> listByTerm(final Long termId, final String query,
                                          final Integer page, final Integer size) {
        final List<Condition> conditions = new ArrayList<>();

        conditions.add(TERM.DELETED_AT.isNull());

        if (StringUtils.isNotBlank(query)) {
            conditions.add(TERM.NAME.containsIgnoreCase(query));
        }

        final var baseQuery = DSL.select(TERM.fields())
            .from(TERM)
            .where(conditions)
            .orderBy(TERM.ID.desc());

        final Table<Record> termCTE = baseQuery.asTable("term_cte");
        final Table<TermToTermRecord> assignedTermRelations = TERM_TO_TERM.asTable("assigned_term_relations");

        final List<Field<?>> groupByFields = Stream.of(termCTE.fields(), NAMESPACE.fields(),
                assignedTermRelations.fields(TERM_TO_TERM.IS_DESCRIPTION_LINK))
            .flatMap(Arrays::stream)
            .toList();

        final var finalQuery = DSL.with(termCTE.getName())
            .as(baseQuery)
            .select(termCTE.fields())
            .select(NAMESPACE.fields())
            .select(assignedTermRelations.field(TERM_TO_TERM.IS_DESCRIPTION_LINK).as(IS_DESCRIPTION_LINK))
            .from(termCTE)
            .join(NAMESPACE).on(NAMESPACE.ID.eq(termCTE.field(TERM.NAMESPACE_ID)))
            .leftJoin(DATA_ENTITY_TO_TERM).on(DATA_ENTITY_TO_TERM.TERM_ID.eq(termCTE.field(TERM.ID)))
            .leftJoin(DATASET_FIELD_TO_TERM).on(DATASET_FIELD_TO_TERM.TERM_ID.eq(termCTE.field(TERM.ID)))
            .leftJoin(assignedTermRelations)
            .on(assignedTermRelations.field(TERM_TO_TERM.TARGET_TERM_ID).eq(termCTE.field(TERM.ID)))
            .where(assignedTermRelations.field(TERM_TO_TERM.ASSIGNED_TERM_ID).eq(termId))
            .groupBy(groupByFields)
            .orderBy(List.of(jooqQueryHelper.getField(termCTE, TERM.ID).desc()))
            .limit(size)
            .offset((page - 1) * size);

        return jooqReactiveOperations.flux(finalQuery)
            .map(this::mapRecordToLinkedTermDto);
    }

    @Override
    public Mono<LinkedTermDto> getTermByIdAndLinkedTermId(final Long assignedTermId, final Long targetTermId) {
        final var baseQuery = DSL.select(TERM.fields())
            .from(TERM)
            .where(TERM.DELETED_AT.isNull())
            .and(TERM.ID.eq(targetTermId))
            .orderBy(TERM.ID.desc());

        final Table<Record> termCTE = baseQuery.asTable("term_cte");
        final Table<TermToTermRecord> assignedTermRelations = TERM_TO_TERM.asTable("assigned_term_relations");

        final var finalQuery = DSL.with(termCTE.getName())
            .as(baseQuery)
            .select(termCTE.fields())
            .select(NAMESPACE.fields())
            .select(assignedTermRelations.field(TERM_TO_TERM.IS_DESCRIPTION_LINK).as(IS_DESCRIPTION_LINK))
            .from(termCTE)
            .join(NAMESPACE).on(NAMESPACE.ID.eq(termCTE.field(TERM.NAMESPACE_ID)))
            .leftJoin(DATA_ENTITY_TO_TERM).on(DATA_ENTITY_TO_TERM.TERM_ID.eq(termCTE.field(TERM.ID)))
            .leftJoin(DATASET_FIELD_TO_TERM).on(DATASET_FIELD_TO_TERM.TERM_ID.eq(termCTE.field(TERM.ID)))
            .leftJoin(assignedTermRelations)
            .on(assignedTermRelations.field(TERM_TO_TERM.TARGET_TERM_ID).eq(termCTE.field(TERM.ID)))
            .where(assignedTermRelations.field(TERM_TO_TERM.ASSIGNED_TERM_ID).eq(assignedTermId));

        return jooqReactiveOperations.mono(finalQuery)
            .map(this::mapRecordToLinkedTermDto);
    }

    private LinkedTermDto mapRecordToLinkedTermDto(final Record record) {
        final TermRefDto termRefDto = mapRecordToRefDto(record);
        return new LinkedTermDto(termRefDto, record.get(IS_DESCRIPTION_LINK, Boolean.class));
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
            .columnsUsingCount(record.get(COLUMNS_COUNT, Integer.class))
            .linkedTermsUsingCount(record.get(LINKED_TERMS_COUNT, Integer.class))
            .queryExampleUsingCount(record.get(QUERY_EXAMPLE_COUNT, Integer.class))
            .ownerships(extractOwnershipRelation(record))
            .build();
    }

    private TermDto mapRecordToDto(final Record record, final String cteName) {
        final TermRefDto refDto = mapRecordToRefDto(record, cteName);
        return TermDto.builder()
            .termRefDto(refDto)
            .entitiesUsingCount(record.get(ENTITIES_COUNT, Integer.class))
            .columnsUsingCount(record.get(COLUMNS_COUNT, Integer.class))
            .linkedTermsUsingCount(record.get(LINKED_TERMS_COUNT, Integer.class))
            .queryExampleUsingCount(record.get(QUERY_EXAMPLE_COUNT, Integer.class))
            .ownerships(extractOwnershipRelation(record))
            .build();
    }

    private TermDetailsDto mapRecordToDetailsDto(final Record record) {
        final var termDto = mapRecordToDto(record);
        return TermDetailsDto.builder()
            .termDto(termDto)
            .tags(jooqRecordHelper.extractAggRelation(record, AGG_TAGS_FIELD, TagPojo.class))
            .terms(extractTerms(record))
            .build();
    }

    private Set<TermOwnershipDto> extractOwnershipRelation(final Record r) {
        final Map<Long, OwnerPojo> ownerDict = jooqRecordHelper.extractAggRelation(r, AGG_OWNERS_FIELD, OwnerPojo.class)
            .stream()
            .collect(Collectors.toMap(OwnerPojo::getId, identity()));

        final Map<Long, TitlePojo> titleDict = jooqRecordHelper.extractAggRelation(r, AGG_TITLES_FIELD, TitlePojo.class)
            .stream()
            .collect(Collectors.toMap(TitlePojo::getId, identity()));

        return jooqRecordHelper.extractAggRelation(r, AGG_OWNERSHIPS_FIELD, TermOwnershipPojo.class)
            .stream()
            .map(os -> {
                final OwnerPojo owner = ownerDict.get(os.getOwnerId());
                if (owner == null) {
                    throw new IllegalArgumentException(
                        String.format("There's no owner with id %s found in ownerDict", os.getOwnerId()));
                }

                final TitlePojo title = titleDict.get(os.getTitleId());
                if (title == null) {
                    throw new IllegalArgumentException(
                        String.format("There's no title with id %s found in titleDict", os.getTitleId()));
                }

                return new TermOwnershipDto(os, owner, title);
            })
            .collect(Collectors.toSet());
    }

    private List<LinkedTermDto> extractTerms(final Record record) {
        final Set<TermPojo> terms =
            jooqRecordHelper.extractAggRelation(record, AGG_ASSIGNED_TERMS, TermPojo.class);

        final Map<Long, NamespacePojo> namespaces = jooqRecordHelper
            .extractAggRelation(record, ASSIGNED_TERM_NAMESPACES, NamespacePojo.class)
            .stream()
            .collect(Collectors.toMap(NamespacePojo::getId, identity()));

        final Map<Long, List<TermToTermPojo>> relations = jooqRecordHelper
            .extractAggRelation(record, ASSIGNED_TERM_RELATIONS, TermToTermPojo.class)
            .stream()
            .collect(Collectors.groupingBy(TermToTermPojo::getAssignedTermId));

        return terms.stream()
            .map(pojo -> {
                final TermRefDto termRefDto = TermRefDto.builder()
                    .term(pojo)
                    .namespace(namespaces.get(pojo.getNamespaceId()))
                    .build();
                final boolean isDescriptionLink = relations.getOrDefault(pojo.getId(), List.of()).stream()
                    .anyMatch(r -> Boolean.TRUE.equals(r.getIsDescriptionLink()));

                return new LinkedTermDto(termRefDto, isDescriptionLink);
            })
            .toList();
    }

    private List<Condition> dateConditions(final OffsetDateTime updatedAtRangeStartDateTime,
                                           final OffsetDateTime updatedAtRangeEndDateTime) {
        if (updatedAtRangeStartDateTime == null && updatedAtRangeEndDateTime == null) {
            return Collections.emptyList();
        }

        final List<Condition> conditions = new ArrayList<>();

        if (updatedAtRangeStartDateTime != null) {
            conditions.add(TERM.UPDATED_AT.greaterOrEqual(DateTimeUtil.mapUTCDateTime(updatedAtRangeStartDateTime)));
        }

        if (updatedAtRangeEndDateTime != null) {
            conditions.add(TERM.UPDATED_AT.lessThan(DateTimeUtil.mapUTCDateTime(updatedAtRangeEndDateTime)));
        }

        return conditions;
    }
}
