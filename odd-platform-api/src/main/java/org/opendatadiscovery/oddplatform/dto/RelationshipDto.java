package org.opendatadiscovery.oddplatform.dto;

import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipPojo;

public record RelationshipDto(RelationshipPojo relationshipPojo,
                              DataEntityPojo sourceDataEntity,
                              DataEntityPojo targetDataEntity,
                              boolean isErd) {
}
