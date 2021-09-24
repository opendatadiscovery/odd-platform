package com.provectus.oddplatform.dto;

import com.provectus.oddplatform.model.tables.pojos.DataSourcePojo;
import com.provectus.oddplatform.model.tables.pojos.NamespacePojo;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.Nullable;

@Data
@RequiredArgsConstructor
public class DataSourceDto {
    private final DataSourcePojo dataSource;

    @Nullable
    private final NamespacePojo namespace;
}
