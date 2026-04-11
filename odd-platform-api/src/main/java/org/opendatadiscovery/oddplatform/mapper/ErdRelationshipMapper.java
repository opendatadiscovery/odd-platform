package org.opendatadiscovery.oddplatform.mapper;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import org.apache.commons.lang3.tuple.Pair;
import org.opendatadiscovery.oddplatform.api.contract.model.ERDRelationshipDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.ERDRelationshipPairs;
import org.opendatadiscovery.oddplatform.dto.ErdRelationshipDetailsDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.springframework.stereotype.Component;

@Component
public class ErdRelationshipMapper {
    public ERDRelationshipDetails mapPojoToDetails(final ErdRelationshipDetailsDto erd) {
        if (erd == null) {
            return null;
        }

        return new ERDRelationshipDetails()
            .erdRelationshipId(erd.pojo().getId())
            .fieldsPairs(mapPairs(erd.fieldPairList()))
            .isIdentifying(erd.pojo().getIsIdentifying())
            .cardinality(erd.pojo().getCardinality());
    }

    private List<ERDRelationshipPairs> mapPairs(final List<Pair<Pair<String, DatasetFieldPojo>,
        Pair<String, DatasetFieldPojo>>> fieldPairsList) {
        if (fieldPairsList.isEmpty()) {
            return Collections.emptyList();
        }

        return fieldPairsList.stream().map(fieldPairs -> new ERDRelationshipPairs()
                .sourceDatasetFieldOddrn(fieldPairs.getLeft().getKey())
                .sourceDatasetFieldId(
                    fieldPairs.getLeft().getValue() != null ? fieldPairs.getLeft().getValue().getId() : null)
                .targetDatasetFieldOddrn(fieldPairs.getRight().getKey())
                .targetDatasetFieldId(
                    fieldPairs.getRight().getValue() != null ? fieldPairs.getRight().getValue().getId() : null))
            .collect(Collectors.toList());
    }
}