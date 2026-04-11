package org.opendatadiscovery.oddplatform.dto;

import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;

public record DataEntityDomainInfoDto(DataEntityPojo domain, long childrenCount) {
}
