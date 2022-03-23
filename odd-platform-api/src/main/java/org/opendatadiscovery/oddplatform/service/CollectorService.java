package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.Collector;
import org.opendatadiscovery.oddplatform.api.contract.model.CollectorFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.CollectorList;
import org.opendatadiscovery.oddplatform.api.contract.model.CollectorUpdateFormData;
import reactor.core.publisher.Mono;

public interface CollectorService
    extends CRUDService<Collector, CollectorList, CollectorFormData, CollectorUpdateFormData> {

    Mono<Collector> regenerateDataSourceToken(final Long collectorId);
}
