package com.provectus.oddplatform.repository.util;

import com.provectus.oddplatform.utils.JSONSerDeUtils;
import org.jooq.Record;
import org.jooq.Table;
import org.springframework.stereotype.Component;

import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import static java.util.Collections.emptySet;

@Component
public class JooqRecordHelper {
    public <T> Set<T> extractAggRelation(final Record r, final String fieldName, final Class<T> fieldPojoClass) {
        final Set<?> set;
        try {
            set = r.get(fieldName, Set.class);
        } catch (final IllegalArgumentException e) {
            return emptySet();
        }

        return set
            .stream()
            .map(t -> JSONSerDeUtils.deserializeJson(t, fieldPojoClass))
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
    }

    public <P> P extractRelation(final Record r, final Table<?> relationTable, final Class<P> pojoClass) {
        final Record relationRecord = r.into(relationTable);
        if (null == relationRecord.get("id")) {
            return null;
        }

        return relationRecord.into(pojoClass);
    }
}
