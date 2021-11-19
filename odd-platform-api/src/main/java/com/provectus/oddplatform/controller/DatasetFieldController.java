package com.provectus.oddplatform.controller;

import com.provectus.oddplatform.api.contract.api.DatasetFieldApi;
import com.provectus.oddplatform.api.contract.model.DataSetField;
import com.provectus.oddplatform.api.contract.model.DatasetFieldUpdateFormData;
import com.provectus.oddplatform.service.DatasetFieldService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class DatasetFieldController implements DatasetFieldApi {

    private final DatasetFieldService datasetFieldService;

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
}
