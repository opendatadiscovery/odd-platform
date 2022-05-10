package org.opendatadiscovery.oddplatform.utils;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.jooq.Field;
import org.jooq.SortOrder;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderByField {

    private Field<?> orderField;
    private SortOrder sortOrder;
}
