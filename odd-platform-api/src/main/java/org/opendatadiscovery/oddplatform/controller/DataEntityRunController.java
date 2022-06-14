package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.DataEntityRunApi;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunStatus;
import org.opendatadiscovery.oddplatform.service.DataEntityRunService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class DataEntityRunController implements DataEntityRunApi {
    private final DataEntityRunService dataEntityRunService;

    @Override
    public Mono<ResponseEntity<DataEntityRunList>> getRuns(final Long dataEntityId,
                                                           final Integer page,
                                                           final Integer size,
                                                           final DataEntityRunStatus status,
                                                           final ServerWebExchange exchange) {
        return dataEntityRunService
            .getDataEntityRuns(dataEntityId, status, page, size)
            .map(ResponseEntity::ok);
    }
}
