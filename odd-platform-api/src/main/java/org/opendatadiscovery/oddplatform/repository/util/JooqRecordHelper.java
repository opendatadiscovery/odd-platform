package org.opendatadiscovery.oddplatform.repository.util;

import com.fasterxml.jackson.core.type.TypeReference;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.Table;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Component;

import static java.util.Collections.emptySet;

@Component
@RequiredArgsConstructor
public class JooqRecordHelper {
    private final DSLContext dslContext;

    public <T> Set<T> extractAggRelation(final Record r,
                                         final String fieldName,
                                         final TypeReference<T> typeReference) {
        return extractSetRelation(r, fieldName, t -> JSONSerDeUtils.deserializeJson(t, typeReference));
    }

    public <T> Set<T> extractAggRelation(final Record r, final String fieldName, final Class<T> fieldPojoClass) {
        return extractSetRelation(r, fieldName, t -> JSONSerDeUtils.deserializeJson(t, fieldPojoClass));
    }

    public <P> P extractRelation(final Record r, final Table<?> relationTable, final Class<P> pojoClass) {
        final Record relationRecord = r.into(relationTable);
        if (null == relationRecord.get("id")) {
            return null;
        }

        return relationRecord.into(pojoClass);
    }

    // returns truncated record with fields that are prefixed with cteName
    public Record remapCte(final Record r, final String cteName, final Table<?> targetTable) {
        final List<Field<?>> remappedFields = new ArrayList<>();
        final Map<String, Object> remappedValues = new HashMap<>();

        for (final Field<?> cteField : r.fields()) {
            final String segm = cteField.getQualifiedName().first();
            if (segm != null && segm.equals(cteName)) {
                final Field<?> targetField = targetTable.field(cteField.getName());

                final Field<?> f = targetField != null ? targetField : cteField;
                remappedFields.add(f);
                remappedValues.put(f.getName(), r.get(cteField.getQualifiedName()));
            }
        }

        final Record record = dslContext.newRecord(remappedFields);
        record.fromMap(remappedValues);
        return record;
    }

    private <T> Set<T> extractSetRelation(final Record r,
                                          final String fieldName,
                                          final Function<? super Object, T> deserializer) {
        final Set<?> set;

        try {
            set = r.get(fieldName, Set.class);
        } catch (final IllegalArgumentException e) {
            return emptySet();
        }

        return set.stream()
            .map(deserializer)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
    }
}
