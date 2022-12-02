package org.opendatadiscovery.oddplatform.service.ingestion.alert;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun;

import static org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun.IngestionTaskRunType;

public interface AlertActionResolver {
    Stream<AlertAction> resolveActions(final Map<String, List<IngestionTaskRun>> taskRuns,
                                       final IngestionTaskRunType taskRunType);

    Stream<AlertAction> resolveActions(final Collection<AlertBISCandidate> candidates);
}
