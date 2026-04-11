package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.TitleList;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TitlePojo;
import reactor.core.publisher.Mono;

public interface TitleService {
    Mono<TitlePojo> getOrCreate(final String name);

    Mono<TitleList> list(final int page, final int size, final String query);
}
