package org.opendatadiscovery.oddplatform.dto;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.Nullable;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;

@Data
@RequiredArgsConstructor
public class DataSourceDto {
    private final DataSourcePojo dataSource;

    @Nullable
    private final NamespacePojo namespace;
}
