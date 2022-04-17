package org.opendatadiscovery.oddplatform.repository.reactive;

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
import org.jooq.Select;
import org.jooq.SelectOnConditionStep;
import org.jooq.Table;
import org.jooq.impl.DSL;
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
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TO_TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.ROLE;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG_TO_TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM_OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.tables.Tag.TAG;

@Repository
public class ReactiveTermRepositoryImpl extends ReactiveAbstractSoftDeleteCRUDRepository<TermRecord, TermPojo>
    implements ReactiveTermRepository {

    private static final String AGG_OWNERS_FIELD = "owners";
    private static final String AGG_OWNERSHIPS_FIELD = "ownerships";
    private static final String AGG_ROLES_FIELD = "roles";
    private static final String AGG_TAGS_FIELD = "tags";

    private final JooqRecordHelper jooqRecordHelper;

    public ReactiveTermRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                      final JooqRecordHelper jooqRecordHelper,
                                      final JooqQueryHelper jooqQueryHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, TERM, TermPojo.class, TERM.NAME, TERM.ID,
            TERM.UPDATED_AT, TERM.IS_DELETED, TERM.DELETED_AT);
        this.jooqRecordHelper = jooqRecordHelper;
    }

    @Override
    public Mono<Page<TermRefDto>> listTermRefDtos(final int page, final int size, final String nameQuery) {
        final Select<TermRecord> homogeneousQuery = DSL.selectFrom(TERM)
            .where(queryCondition(nameQuery));

        final Select<? extends Record> termSelect =
            jooqQueryHelper.paginate(homogeneousQuery, (page - 1) * size, size);

        final Table<? extends Record> termCTE = termSelect.asTable("term_cte");

        final SelectOnConditionStep<Record> query = DSL.with(termCTE.getName())
            .as(termSelect)
            .select(termCTE.fields())
            .select(NAMESPACE.asterisk())
            .from(termCTE.getName())
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(termCTE.field(TERM.NAMESPACE_ID)));

        return jooqReactiveOperations.flux(query)
            .collectList()
            .flatMap(records -> jooqQueryHelper.pageifyResult(
                records,
                r -> mapRecordToRefDto(r, termCTE.getName()),
                fetchCount(nameQuery)
            ));
    }

    @Override
    public Mono<TermRefDto> getTermRefDtoByNameAndNamespace(final String name, final String namespaceName) {
        final var query = DSL
            .select(TERM.fields())
            .select(NAMESPACE.fields())
            .from(TERM)
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(TERM.NAMESPACE_ID))
            .where(TERM.NAME.eq(name).and(TERM.IS_DELETED.isFalse())
                .and(NAMESPACE.NAME.eq(namespaceName)));
        return jooqReactiveOperations.mono(query)
            .map(this::mapRecordToRefDto);
    }

    @Override
    public Mono<TermRefDto> getTermRefDto(final Long id) {
        final var query = DSL
            .select(TERM.fields())
            .select(NAMESPACE.fields())
            .from(TERM)
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(TERM.NAMESPACE_ID))
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
            .from(TERM)
            .leftJoin(TERM_OWNERSHIP).on(TERM_OWNERSHIP.TERM_ID.eq(TERM.ID))
            .leftJoin(OWNER).on(OWNER.ID.eq(TERM_OWNERSHIP.OWNER_ID))
            .leftJoin(ROLE).on(ROLE.ID.eq(TERM_OWNERSHIP.ROLE_ID))
            .leftJoin(TAG_TO_TERM).on(TAG_TO_TERM.TERM_ID.eq(TERM.ID))
            .leftJoin(TAG).on(TAG_TO_TERM.TAG_ID.eq(TAG.ID))
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(TERM.NAMESPACE_ID))
            .where(TERM.ID.eq(id).and(TERM.IS_DELETED.isFalse()))
            .groupBy(groupByFields);
        return jooqReactiveOperations.mono(query)
            .map(this::mapRecordToDetailsDto);
    }

    @Override
    public Flux<DataEntityToTermPojo> deleteRelationsWithDataEntities(final Long termId) {
        final var query = DSL.deleteFrom(DATA_ENTITY_TO_TERM)
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
            .onDuplicateKeyIgnore()
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(DataEntityToTermPojo.class));
    }

    @Override
    public Mono<DataEntityToTermPojo> deleteRelationWithDataEntity(final Long dataEntityId, final Long termId) {
        final var query = DSL.deleteFrom(DATA_ENTITY_TO_TERM)
            .where(DATA_ENTITY_TO_TERM.DATA_ENTITY_ID.eq(dataEntityId).and(DATA_ENTITY_TO_TERM.TERM_ID.eq(termId)))
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(DataEntityToTermPojo.class));
    }

    private List<Condition> queryCondition(final String nameQuery) {
        final var conditionsList = new ArrayList<Condition>();

        conditionsList.add(TERM.IS_DELETED.isFalse());
        if (StringUtils.isNotEmpty(nameQuery)) {
            conditionsList.add(TERM.NAME.startsWithIgnoreCase(nameQuery));
        }

        return conditionsList;
    }

    private TermRefDto mapRecordToRefDto(final Record record) {
        return TermRefDto.builder()
            .term(record.into(TERM).into(TermPojo.class))
            .namespace(record.into(NAMESPACE).into(NamespacePojo.class))
            .build();
    }

    private TermDto mapRecordToDto(final Record record) {
        final TermRefDto refDto = mapRecordToRefDto(record);
        return TermDto.builder()
            .termRefDto(refDto)
            .entitiesUsingCount(null)
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

    private TermRefDto mapRecordToRefDto(final Record record, final String termCteName) {
        return TermRefDto.builder()
            .term(jooqRecordHelper.remapCte(record, termCteName, TERM).into(TermPojo.class))
            .namespace(record.into(NAMESPACE).into(NamespacePojo.class))
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

                return new TermOwnershipDto(owner, role);
            })
            .collect(Collectors.toSet());
    }
}
