package org.opendatadiscovery.oddplatform.dto;

import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;

public record DataSourceDto(DataSourcePojo dataSource, NamespacePojo namespace, TokenDto token) {
}
