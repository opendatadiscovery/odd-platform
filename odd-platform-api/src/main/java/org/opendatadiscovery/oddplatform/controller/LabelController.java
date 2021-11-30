package org.opendatadiscovery.oddplatform.controller;

import org.opendatadiscovery.oddplatform.api.contract.api.LabelApi;
import org.opendatadiscovery.oddplatform.api.contract.model.Label;
import org.opendatadiscovery.oddplatform.api.contract.model.LabelFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LabelsResponse;
import org.opendatadiscovery.oddplatform.service.LabelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RestController
public class LabelController
    extends AbstractCRUDController<Label, LabelsResponse, LabelFormData, LabelFormData, LabelService>
    implements LabelApi {

    public LabelController(final LabelService entityService) {
        super(entityService);
    }

    @Override
    public Mono<ResponseEntity<Flux<Label>>> createLabel(final Flux<LabelFormData> labelFormData,
                                                         final ServerWebExchange exchange) {
        return labelFormData.collectList()
            .publishOn(Schedulers.boundedElastic())
            .map(entityService::bulkCreate)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteLabel(final Long labelId,
                                                  final ServerWebExchange exchange) {
        return delete(labelId);
    }

    @Override
    public Mono<ResponseEntity<LabelsResponse>> getLabelList(final Integer page,
                                                             final Integer size,
                                                             final String query,
                                                             final ServerWebExchange exchange) {
        return list(page, size, query);
    }

    @Override
    public Mono<ResponseEntity<Label>> updateLabel(final Long labelId,
                                                   final Mono<LabelFormData> labelFormData,
                                                   final ServerWebExchange exchange) {
        return update(labelId, labelFormData);
    }
}
