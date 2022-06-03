package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.LabelApi;
import org.opendatadiscovery.oddplatform.api.contract.model.Label;
import org.opendatadiscovery.oddplatform.api.contract.model.LabelFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LabelsResponse;
import org.opendatadiscovery.oddplatform.service.ReactiveLabelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class LabelController implements LabelApi {
    private final ReactiveLabelService labelService;

    @Override
    public Mono<ResponseEntity<LabelsResponse>> getLabelList(final Integer page,
                                                             final Integer size,
                                                             final String query,
                                                             final ServerWebExchange exchange) {
        return labelService.list(page, size, query).map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Flux<Label>>> createLabel(final Flux<LabelFormData> labelFormData,
                                                         final ServerWebExchange exchange) {
        return labelFormData.collectList()
            .map(labelService::bulkUpsert)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Label>> updateLabel(final Long labelId,
                                                   final Mono<LabelFormData> labelFormData,
                                                   final ServerWebExchange exchange) {
        return labelFormData
            .flatMap(form -> labelService.update(labelId, form))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteLabel(final Long labelId,
                                                  final ServerWebExchange exchange) {
        return labelService.delete(labelId).thenReturn(ResponseEntity.noContent().build());
    }
}
