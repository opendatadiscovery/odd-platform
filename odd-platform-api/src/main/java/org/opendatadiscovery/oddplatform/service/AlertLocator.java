package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import reactor.core.publisher.Flux;

public interface AlertLocator {
    Flux<AlertPojo> locateAlerts(final IngestionRequest request);
}
