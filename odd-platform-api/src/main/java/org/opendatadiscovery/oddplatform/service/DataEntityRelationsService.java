package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind;
import reactor.core.publisher.Mono;

public interface DataEntityRelationsService {
    Mono<List<String>> getDependentDataEntityOddrns(final LineageStreamKind streamKind);
}
