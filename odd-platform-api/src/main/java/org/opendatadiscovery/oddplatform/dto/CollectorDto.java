package org.opendatadiscovery.oddplatform.dto;

import org.opendatadiscovery.oddplatform.model.tables.pojos.CollectorPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;

public record CollectorDto(CollectorPojo collectorPojo, NamespacePojo namespace, TokenDto tokenDto) {
}