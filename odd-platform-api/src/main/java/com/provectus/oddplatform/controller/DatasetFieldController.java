package com.provectus.oddplatform.controller;

import com.provectus.oddplatform.api.contract.api.DatasetFieldApi;
import com.provectus.oddplatform.api.contract.model.DatasetFieldLabelsFormData;
import com.provectus.oddplatform.api.contract.model.InternalDescription;
import com.provectus.oddplatform.api.contract.model.InternalDescriptionFormData;
import com.provectus.oddplatform.api.contract.model.Label;
import com.provectus.oddplatform.service.DatasetFieldService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import javax.validation.Valid;

@RestController
@RequiredArgsConstructor
public class DatasetFieldController implements DatasetFieldApi {
    private final DatasetFieldService datasetFieldService;

    @Override
    public Mono<ResponseEntity<InternalDescription>> upsertDatasetFieldInternalDescription(
        final Long datasetFieldId,
        @Valid final Mono<InternalDescriptionFormData> internalDescriptionFormData,
        final ServerWebExchange exchange
    ) {
        return internalDescriptionFormData
            .publishOn(Schedulers.boundedElastic())
            .flatMap(form -> datasetFieldService.upsertDescription(datasetFieldId, form))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Flux<Label>>> upsertDatasetFieldLabels(
        final Long datasetFieldId,
        final Mono<DatasetFieldLabelsFormData> datasetFieldLabelsFormData,
        final ServerWebExchange exchange
    ) {
        final Flux<Label> labels = datasetFieldLabelsFormData
            .publishOn(Schedulers.boundedElastic())
            .flatMapMany(form -> datasetFieldService.upsertLabels(datasetFieldId, form));

        return Mono.just(ResponseEntity.ok(labels));
    }
}
