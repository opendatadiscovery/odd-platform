package com.provectus.oddplatform.dto;

import com.provectus.oddplatform.model.tables.pojos.DataSourcePojo;
import com.provectus.oddplatform.model.tables.pojos.NamespacePojo;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class DataSourceDto {
    private final DataSourcePojo dataSource;
    private final NamespacePojo namespace;
}
