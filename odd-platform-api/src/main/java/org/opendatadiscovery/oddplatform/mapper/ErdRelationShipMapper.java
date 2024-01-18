package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.mapstruct.Mapper;
import org.opendatadiscovery.oddplatform.api.contract.model.ERDRelationshipDetails;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ErdRelationshipPojo;

@Mapper(config = MapperConfig.class,
    uses = {
        DateTimeMapper.class,
        DataEntityMapper.class,
    })
public abstract class ErdRelationShipMapper {
    public List<ERDRelationshipDetails> pojoListToDetailsList(final List<ErdRelationshipPojo> erds) {
        return erds.stream()
            .map(erd -> new ERDRelationshipDetails()
                .erdRelationshipsId(erd.getId())
                .sourceDatasetFieldOddrn(erd.getSourceDatasetFieldOddrn())
                .targetDatasetFieldOddrn(erd.getTargetDatasetFieldOddrn())
                .isIdentifying(erd.getIsIdentifying())
                .cardinality(erd.getCardinality()))
            .toList();
    }
}