package org.opendatadiscovery.oddplatform.dto;

import lombok.Builder;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GraphRelationshipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;

@Builder
public record RelationshipDetailsDto(DataEntityPojo dataEntityRelationship,
                                     RelationshipsPojo relationshipPojo,
                                     DataEntityPojo sourceDataEntity,
                                     DataEntityPojo targetDataEntity,
                                     DataSourcePojo dataSourcePojo,
                                     NamespacePojo dataSourceNamespacePojo,
                                     ErdRelationshipDetailsDto erdRelationshipDetailsDto,
                                     GraphRelationshipPojo graphRelationshipPojo) {
}
