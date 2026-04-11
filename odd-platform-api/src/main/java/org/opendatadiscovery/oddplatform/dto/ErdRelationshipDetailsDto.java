package org.opendatadiscovery.oddplatform.dto;

import java.util.List;
import lombok.Builder;
import org.apache.commons.lang3.tuple.Pair;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ErdRelationshipDetailsPojo;

@Builder
public record ErdRelationshipDetailsDto(ErdRelationshipDetailsPojo pojo,
                                        List<Pair<
                                            Pair<String, DatasetFieldPojo>,
                                            Pair<String, DatasetFieldPojo>>> fieldPairList) {
}
