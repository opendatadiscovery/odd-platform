package org.opendatadiscovery.oddplatform.repository.util;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.jooq.Condition;
import org.jooq.Field;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.dto.SearchFilterDto;

import static org.jooq.impl.DSL.field;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.LABEL;
import static org.opendatadiscovery.oddplatform.model.Tables.METADATA_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.METADATA_FIELD_VALUE;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.TITLE;

public class FTSConstants {
    public static final Field<Object> RANK_FIELD_ALIAS = field("rank", Object.class);

    public static final Map<Field<?>, String> DATA_ENTITY_FTS_WEIGHTS = Map.ofEntries(
        Map.entry(DATA_ENTITY.INTERNAL_NAME, "A"),
        Map.entry(DATA_ENTITY.EXTERNAL_NAME, "A"),
        Map.entry(DATA_ENTITY.INTERNAL_DESCRIPTION, "B"),
        Map.entry(DATA_ENTITY.EXTERNAL_DESCRIPTION, "B"),
        Map.entry(DATA_SOURCE.NAME, "B"),
        Map.entry(DATA_SOURCE.ODDRN, "D"),
        Map.entry(DATA_SOURCE.CONNECTION_URL, "D"),
        Map.entry(NAMESPACE.NAME, "B"),
        Map.entry(TAG.NAME, "B"),
        Map.entry(METADATA_FIELD.NAME, "C"),
        Map.entry(METADATA_FIELD_VALUE.VALUE, "D"),
        Map.entry(DATASET_FIELD.NAME, "C"),
        Map.entry(DATASET_FIELD.INTERNAL_DESCRIPTION, "C"),
        Map.entry(DATASET_FIELD.EXTERNAL_DESCRIPTION, "C"),
        Map.entry(LABEL.NAME, "C"),
        Map.entry(TITLE.NAME, "D"),
        Map.entry(OWNER.NAME, "C")
    );

    public static final Map<Field<?>, String> TERM_FTS_WEIGHTS = Map.ofEntries(
        Map.entry(TERM.NAME, "A"),
        Map.entry(TERM.DEFINITION, "B"),
        Map.entry(NAMESPACE.NAME, "B"),
        Map.entry(TAG.NAME, "B"),
        Map.entry(OWNER.NAME, "C"),
        Map.entry(TITLE.NAME, "D")
    );

    public static final Map<FacetType, Function<List<SearchFilterDto>, Condition>> DATA_ENTITY_CONDITIONS =
        Map.of(
            FacetType.ENTITY_CLASSES, filters -> DATA_ENTITY.ENTITY_CLASS_IDS
                .contains(extractFilterId(filters).stream().map(Long::intValue).toArray(Integer[]::new)),
            FacetType.DATA_SOURCES, filters -> DATA_ENTITY.DATA_SOURCE_ID.in(extractFilterId(filters)),
            FacetType.NAMESPACES, filters -> DATA_SOURCE.NAMESPACE_ID.in(extractFilterId(filters)),
            FacetType.TYPES, filters -> DATA_ENTITY.TYPE_ID.in(extractFilterId(filters)),
            FacetType.OWNERS, filters -> OWNER.ID.in(extractFilterId(filters)),
            FacetType.TAGS, filters -> TAG.ID.in(extractFilterId(filters))
        );

    public static final Map<FacetType, Function<List<SearchFilterDto>, Condition>> TERM_CONDITIONS = Map.of(
        FacetType.NAMESPACES, filters -> TERM.NAMESPACE_ID.in(extractFilterId(filters)),
        FacetType.OWNERS, filters -> OWNER.ID.in(extractFilterId(filters)),
        FacetType.TAGS, filters -> TAG.ID.in(extractFilterId(filters))
    );

    private static List<Long> extractFilterId(final List<SearchFilterDto> filters) {
        return filters.stream()
            .map(SearchFilterDto::getEntityId)
            .collect(Collectors.toList());
    }
}
