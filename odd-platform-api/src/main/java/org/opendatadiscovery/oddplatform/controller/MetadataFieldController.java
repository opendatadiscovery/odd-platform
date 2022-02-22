package org.opendatadiscovery.oddplatform.controller;

import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.MetadataApi;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldList;
import org.opendatadiscovery.oddplatform.service.MetadataFieldService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RestController
@RequiredArgsConstructor
public class MetadataFieldController implements MetadataApi {
    private final MetadataFieldService metadataFieldService;

    @Override
    public Mono<ResponseEntity<MetadataFieldList>> getMetadataFieldList(@Valid final String query,
                                                                        final ServerWebExchange exchange) {
        return metadataFieldService.list(query)
            .subscribeOn(Schedulers.boundedElastic())
            .map(ResponseEntity::ok);
    }
}
