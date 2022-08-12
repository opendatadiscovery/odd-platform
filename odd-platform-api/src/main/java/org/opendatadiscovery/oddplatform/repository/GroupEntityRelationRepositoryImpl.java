package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Name;
import org.opendatadiscovery.oddplatform.annotation.BlockingTransactional;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GroupEntityRelationsPojo;
import org.springframework.stereotype.Repository;

import static java.util.stream.Collectors.toList;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.name;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.GROUP_ENTITY_RELATIONS;

@Repository
@RequiredArgsConstructor
public class GroupEntityRelationRepositoryImpl implements GroupEntityRelationRepository {
    private final DSLContext dslContext;

    @Override
    public Map<String, List<String>> fetchGroupRelations(final Collection<String> childOddrns) {
        if (CollectionUtils.isEmpty(childOddrns)) {
            return Map.of();
        }

        return dslContext
            .select(
                GROUP_ENTITY_RELATIONS.GROUP_ODDRN,
                GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN
            )
            .from(GROUP_ENTITY_RELATIONS)
            .where(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.in(childOddrns))
            .fetchGroups(GROUP_ENTITY_RELATIONS.GROUP_ODDRN, GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN);
    }

    @Override
    public List<String> getDEGEntitiesOddrns(final long dataEntityGroupId) {
        final Name cteName = name("t");
        final Field<String> tDataEntityOddrn = field("t.data_entity_oddrn", String.class);

        final String groupOddrn = dslContext.select(DATA_ENTITY.ODDRN)
            .from(DATA_ENTITY)
            .where(DATA_ENTITY.ID.eq(dataEntityGroupId))
            .fetchOptionalInto(String.class)
            .orElseThrow(NotFoundException::new);

        final var cte = cteName.as(dslContext
            .select(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN)
            .from(GROUP_ENTITY_RELATIONS)
            .where(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.eq(groupOddrn))
            .unionAll(
                dslContext
                    .select(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN)
                    .from(GROUP_ENTITY_RELATIONS)
                    .join(cteName).on(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.eq(tDataEntityOddrn))
            ));

        return dslContext.withRecursive(cte)
            .selectDistinct(cte.field(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN))
            .from(cte.getName())
            .fetchStreamInto(String.class)
            .collect(toList());
    }
}