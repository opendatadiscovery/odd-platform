package org.opendatadiscovery.oddplatform.dto;

import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ErdRelationshipDetailsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GraphRelationshipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;

public record RelationshipDto(RelationshipsPojo relationshipPojo,
                              DataEntityPojo sourceDataEntity,
                              DataEntityPojo targetDataEntity,
                              ErdRelationshipDetailsPojo erdRelationshipDetailsPojo,
                              GraphRelationshipPojo graphRelationshipPojo,
                              boolean isErd) {
}
