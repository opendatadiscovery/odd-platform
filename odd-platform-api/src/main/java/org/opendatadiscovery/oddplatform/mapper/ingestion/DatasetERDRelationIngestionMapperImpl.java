package org.opendatadiscovery.oddplatform.mapper.ingestion;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.ERDRelationship;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ErdRelationshipDetailsPojo;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatasetERDRelationIngestionMapperImpl implements DatasetERDRelationIngestionMapper {

    @Override
    public ErdRelationshipDetailsPojo mapERDRelation(final ERDRelationship erd) {
        return new ErdRelationshipDetailsPojo()
            .setSourceDatasetFieldOddrn(erd.getSourceDatasetFieldOddrnsList().toArray(String[]::new))
            .setTargetDatasetFieldOddrn(erd.getTargetDatasetFieldOddrnsList().toArray(String[]::new))
            .setCardinality(erd.getCardinality() != null ? erd.getCardinality().getValue() : null)
            .setIsIdentifying(erd.getIsIdentifying());
    }
}
