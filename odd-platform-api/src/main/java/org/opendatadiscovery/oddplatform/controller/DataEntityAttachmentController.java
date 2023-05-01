package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.DataEntityAttachmentApi;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityAttachments;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityFile;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLink;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLinkFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLinkListFormData;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.Part;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class DataEntityAttachmentController implements DataEntityAttachmentApi {

    @Override
    public Mono<ResponseEntity<DataEntityAttachments>> getAttachments(final Long dataEntityId,
                                                                      final ServerWebExchange exchange) {
        return DataEntityAttachmentApi.super.getAttachments(dataEntityId, exchange);
    }

    @Override
    public Mono<ResponseEntity<Flux<DataEntityFile>>> saveFiles(final Long dataEntityId,
                                                                final Flux<Part> files,
                                                                final ServerWebExchange exchange) {
        return DataEntityAttachmentApi.super.saveFiles(dataEntityId, files, exchange);
    }

    @Override
    public Mono<ResponseEntity<Resource>> downloadFile(final Long dataEntityId,
                                                       final Long fileId,
                                                       final ServerWebExchange exchange) {
        return DataEntityAttachmentApi.super.downloadFile(dataEntityId, fileId, exchange);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteFile(final Long dataEntityId,
                                                 final Long fileId,
                                                 final ServerWebExchange exchange) {
        return DataEntityAttachmentApi.super.deleteFile(dataEntityId, fileId, exchange);
    }

    @Override
    public Mono<ResponseEntity<Flux<DataEntityLink>>> saveLinks(final Long dataEntityId,
                                                                final Mono<DataEntityLinkListFormData> formData,
                                                                final ServerWebExchange exchange) {
        return DataEntityAttachmentApi.super.saveLinks(dataEntityId, formData, exchange);
    }

    @Override
    public Mono<ResponseEntity<DataEntityLink>> updateLink(final Long dataEntityId,
                                                           final Long linkId,
                                                           final Mono<DataEntityLinkFormData> dataEntityLinkFormData,
                                                           final ServerWebExchange exchange) {
        return DataEntityAttachmentApi.super.updateLink(dataEntityId, linkId, dataEntityLinkFormData, exchange);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteLink(final Long dataEntityId,
                                                 final Long linkId,
                                                 final ServerWebExchange exchange) {
        return DataEntityAttachmentApi.super.deleteLink(dataEntityId, linkId, exchange);
    }
}
