package org.opendatadiscovery.oddplatform.service.ingestion.alert;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.apache.commons.collections4.MultiValuedMap;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;

public interface AlertActionResolver {
    Collection<AlertAction> resolveActions(final Map<String, Map<Short, AlertPojo>> state,
                                           final MultiValuedMap<String, String> helperMap,
                                           final List<IngestionTaskRun> runs
    );
}
