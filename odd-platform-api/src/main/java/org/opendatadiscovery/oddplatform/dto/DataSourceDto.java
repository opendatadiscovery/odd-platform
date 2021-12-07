package org.opendatadiscovery.oddplatform.dto;

import org.jetbrains.annotations.Nullable;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;

public record DataSourceDto(DataSourcePojo dataSource,
                            @Nullable NamespacePojo namespace) {
}
