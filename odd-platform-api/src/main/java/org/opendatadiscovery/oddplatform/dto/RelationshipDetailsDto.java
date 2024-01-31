package org.opendatadiscovery.oddplatform.dto;

import lombok.Builder;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ErdRelationshipDetailsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GraphRelationshipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;

@Builder
public record RelationshipDetailsDto(DataEntityPojo dataEntityRelationship,
                                     RelationshipsPojo relationshipPojo,
                                     DataEntityPojo sourceDataEntity,
                                     DataEntityPojo targetDataEntity,
                                     ErdRelationshipDetailsPojo erdRelationshipDetailsPojo,
                                     GraphRelationshipPojo graphRelationshipPojo) {
}
