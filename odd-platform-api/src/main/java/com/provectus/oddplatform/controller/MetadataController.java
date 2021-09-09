package com.provectus.oddplatform.controller;

import com.provectus.oddplatform.api.contract.api.MetadataApi;
import com.provectus.oddplatform.api.contract.model.MetadataField;
import com.provectus.oddplatform.api.contract.model.MetadataFieldFormData;
import com.provectus.oddplatform.api.contract.model.MetadataFieldList;
import com.provectus.oddplatform.api.contract.model.MetadataUpdateCustomFieldFormData;
import com.provectus.oddplatform.service.MetadataService;
import javax.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
public class MetadataController
    extends
    AbstractCRUDController<MetadataField, MetadataFieldList, MetadataFieldFormData,
        MetadataUpdateCustomFieldFormData, MetadataService>
    implements MetadataApi {

    public MetadataController(final MetadataService entityService) {
        super(entityService);
    }

    @Override
    public Mono<ResponseEntity<MetadataField>> createCustomField(
        @Valid final Mono<MetadataFieldFormData> metadataFieldFormData,
        final ServerWebExchange exchange
    ) {
        return create(metadataFieldFormData);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteCustomField(
        final Long metadataFieldId,
        final ServerWebExchange exchange
    ) {
        return delete(metadataFieldId);
    }

    @Override
    public Mono<ResponseEntity<MetadataFieldList>> getMetadataFieldList(
        @Valid final String query,
        final ServerWebExchange exchange
    ) {
        return list(query);
    }

    @Override
    public Mono<ResponseEntity<MetadataField>> updateCustomField(
        final Long metadataFieldId,
        @Valid final Mono<MetadataUpdateCustomFieldFormData> metadataUpdateCustomFieldFormData,
        final ServerWebExchange exchange
    ) {
        return update(metadataFieldId, metadataUpdateCustomFieldFormData);
    }
}
