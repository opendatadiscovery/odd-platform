package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.DatasetFieldApi;
import org.opendatadiscovery.oddplatform.api.contract.model.BulkEnumValueFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.EnumValueList;
import org.opendatadiscovery.oddplatform.service.DatasetFieldService;
import org.opendatadiscovery.oddplatform.service.EnumValueService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RestController
@RequiredArgsConstructor
public class DatasetFieldController implements DatasetFieldApi {
    private final DatasetFieldService datasetFieldService;
    private final EnumValueService enumValueService;

    @Override
    public Mono<ResponseEntity<DataSetField>> updateDatasetField(
        final Long datasetFieldId,
        final Mono<DatasetFieldUpdateFormData> datasetFieldUpdateFormData,
        final ServerWebExchange exchange
    ) {
        return datasetFieldUpdateFormData
            .flatMap(formData -> datasetFieldService.updateDatasetField(datasetFieldId, formData))
            .map(ResponseEntity::ok);
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
