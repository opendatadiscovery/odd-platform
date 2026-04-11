package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.opendatadiscovery.oddplatform.dto.DataEntitySpecificAttributesDelta;
import org.opendatadiscovery.oddplatform.service.ingestion.alert.AlertBISCandidate;
import reactor.core.publisher.Flux;

public interface AlertLocator {
    Flux<AlertBISCandidate> getAlertBISCandidates(final List<DataEntitySpecificAttributesDelta> deltas,
                                                  final List<Long> changedDatasetIds);
}
