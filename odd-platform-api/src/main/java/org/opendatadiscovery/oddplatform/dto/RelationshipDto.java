package org.opendatadiscovery.oddplatform.dto;

import lombok.Builder;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;

@Builder
public record RelationshipDto(DataEntityPojo dataEntityRelationship,
                              RelationshipsPojo relationshipPojo,
                              DataEntityPojo sourceDataEntity,
                              DataEntityPojo targetDataEntity) {
}
