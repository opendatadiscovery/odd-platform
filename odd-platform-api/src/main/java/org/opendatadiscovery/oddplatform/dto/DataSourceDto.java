package org.opendatadiscovery.oddplatform.dto;

import org.jetbrains.annotations.Nullable;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;

public record DataSourceDto(DataSourcePojo dataSource,
                            @Nullable NamespacePojo namespace,
                            @Nullable TokenDto token) {
}
