package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import org.opendatadiscovery.oddplatform.api.contract.model.ERDRelationshipDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.ERDRelationshipPairs;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ErdRelationshipDetailsPojo;
import org.springframework.stereotype.Component;
import org.thymeleaf.util.ArrayUtils;

@Component
public class ErdRelationshipMapper {
    public ERDRelationshipDetails mapPojoToDetails(final ErdRelationshipDetailsPojo erd) {
        return new ERDRelationshipDetails()
            .erdRelationshipId(erd.getId())
            .fieldsPairs(mapPairs(erd.getSourceDatasetFieldOddrn(), erd.getTargetDatasetFieldOddrn()))
            .isIdentifying(erd.getIsIdentifying())
            .cardinality(erd.getCardinality());
    }

    private List<ERDRelationshipPairs> mapPairs(final String[] source, final String[] target) {
        if (ArrayUtils.isEmpty(source)) {
            return null;
        }

        return IntStream.range(0, source.length).mapToObj(i -> new ERDRelationshipPairs()
                .sourceDatasetFieldOddrn(source[i])
                .targetDatasetFieldOddrn(target[i])).collect(Collectors.toList());
    }
}