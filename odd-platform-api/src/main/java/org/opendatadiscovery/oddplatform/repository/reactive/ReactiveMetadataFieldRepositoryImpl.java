package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import org.jooq.Condition;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataKey;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataOrigin;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.MetadataFieldRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.METADATA_FIELD;

@Repository
public class ReactiveMetadataFieldRepositoryImpl
    extends ReactiveAbstractSoftDeleteCRUDRepository<MetadataFieldRecord, MetadataFieldPojo>
    implements ReactiveMetadataFieldRepository {

    public ReactiveMetadataFieldRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                               final JooqQueryHelper jooqQueryHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, METADATA_FIELD, MetadataFieldPojo.class);
    }

    @Override
    public Mono<List<MetadataFieldPojo>> listInternalMetadata(final String query) {
        final List<Condition> conditions =
            addSoftDeleteFilter(METADATA_FIELD.ORIGIN.eq(MetadataOrigin.INTERNAL.name()));
        if (StringUtils.hasLength(query)) {
            conditions.add(nameField.containsIgnoreCase(query));
        }

        final var select = DSL.selectFrom(METADATA_FIELD)
            .where(conditions);
        return jooqReactiveOperations.flux(select)
            .map(r -> r.into(MetadataFieldPojo.class))
            .collectList();
    }

    @Override
    public Flux<MetadataFieldPojo> listByKey(final Collection<MetadataKey> keys) {
        if (keys.isEmpty()) {
            return Flux.just();
        }

        final Condition condition = keys.stream()
            .map(t -> METADATA_FIELD.NAME.eq(t.fieldName()).and(METADATA_FIELD.TYPE.eq(t.fieldType().toString())))
            .reduce(Condition::or)
            .orElseThrow();

        return jooqReactiveOperations
            .flux(DSL.selectFrom(METADATA_FIELD).where(addSoftDeleteFilter(condition)))
            .map(this::recordToPojo);
    }
}
