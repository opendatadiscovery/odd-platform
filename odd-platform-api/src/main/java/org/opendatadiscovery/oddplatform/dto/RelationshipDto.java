package org.opendatadiscovery.oddplatform.dto;

import lombok.Builder;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;

@Builder
public record RelationshipDto(DataEntityPojo dataEntityRelationship,
                              RelationshipsPojo relationshipPojo,
                              DataSourcePojo dataSourcePojo,
                              NamespacePojo relationshipNamespacePojo,
                              NamespacePojo dataSourceNamespacePojo,
                              DataEntityPojo sourceDataEntity,
                              DataEntityPojo targetDataEntity) {
}
