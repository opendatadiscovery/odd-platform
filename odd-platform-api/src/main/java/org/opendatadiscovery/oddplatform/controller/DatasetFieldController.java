package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.DatasetFieldApi;
import org.opendatadiscovery.oddplatform.api.contract.model.BulkEnumValueFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldDescription;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldDescriptionUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldLabelsUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.EnumValueList;
import org.opendatadiscovery.oddplatform.api.contract.model.Label;
import org.opendatadiscovery.oddplatform.service.DatasetFieldService;
import org.opendatadiscovery.oddplatform.service.EnumValueService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class DatasetFieldController implements DatasetFieldApi {
    private final DatasetFieldService datasetFieldService;
    private final EnumValueService enumValueService;

    @Override
    public Mono<ResponseEntity<DataSetFieldDescription>> updateDatasetFieldDescription(
        final Long datasetFieldId,
        final Mono<DatasetFieldDescriptionUpdateFormData> formDataMono,
        final ServerWebExchange exchange) {
        return formDataMono
            .flatMap(formData -> datasetFieldService.updateDatasetFieldDescription(datasetFieldId, formData))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Flux<Label>>> updateDatasetFieldLabels(
        final Long datasetFieldId,
        final Mono<DatasetFieldLabelsUpdateFormData> formDataMono,
        final ServerWebExchange exchange) {
        final Flux<Label> labels = formDataMono
            .flatMapMany(formData -> datasetFieldService.updateDatasetFieldLabels(datasetFieldId, formData));
        return Mono.just(ResponseEntity.ok(labels));
    }

    @Override
    public Mono<ResponseEntity<EnumValueList>> createEnumValue(final Long datasetFieldId,
                                                               final Mono<BulkEnumValueFormData> bulkEnumValueFormData,
                                                               final ServerWebExchange exchange) {
        return bulkEnumValueFormData
            .flatMap(formData -> enumValueService.createEnumValues(datasetFieldId, formData.getItems()))
            .map(e -> new ResponseEntity<>(e, HttpStatus.CREATED));
    }

    @Override
    public Mono<ResponseEntity<EnumValueList>> getEnumValues(final Long datasetFieldId,
                                                             final ServerWebExchange exchange) {
        return enumValueService.getEnumValues(datasetFieldId)
            .map(ResponseEntity::ok);
    }
}
