package org.opendatadiscovery.oddplatform.repository.util;

import org.jooq.Field;
import org.jooq.SortOrder;

public record OrderByField(Field<?> orderField, SortOrder sortOrder) {
}
