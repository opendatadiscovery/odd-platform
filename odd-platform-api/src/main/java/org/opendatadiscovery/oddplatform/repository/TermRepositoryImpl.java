package org.opendatadiscovery.oddplatform.repository;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.opendatadiscovery.oddplatform.dto.term.TermRefDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.springframework.stereotype.Repository;

import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TO_TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM;

@Repository
@RequiredArgsConstructor
public class TermRepositoryImpl implements TermRepository {

    private final DSLContext dslContext;

    @Override
    public List<TermRefDto> findTermsByDataEntityId(final Long dataEntityId) {
        return dslContext
            .select(TERM.fields())
            .select(NAMESPACE.fields())
            .from(TERM)
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(TERM.NAMESPACE_ID))
            .join(DATA_ENTITY_TO_TERM).on(DATA_ENTITY_TO_TERM.TERM_ID.eq(TERM.ID)
                .and(DATA_ENTITY_TO_TERM.DATA_ENTITY_ID.eq(dataEntityId)).and(DATA_ENTITY_TO_TERM.DELETED_AT.isNull()))
            .fetchStream()
            .map(this::mapRecordToRefDto)
            .toList();
    }

    private TermRefDto mapRecordToRefDto(final Record record) {
        return TermRefDto.builder()
            .term(record.into(TERM).into(TermPojo.class))
            .namespace(record.into(NAMESPACE).into(NamespacePojo.class))
            .build();
    }
}
