package org.opendatadiscovery.oddplatform.controller;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.DataEntityAttachmentApi;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityAttachments;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityFile;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLink;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLinkFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLinkListFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityUpload;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityUploadFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityUploadOptions;
import org.opendatadiscovery.oddplatform.service.attachment.AttachmentService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.Part;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class DataEntityAttachmentController implements DataEntityAttachmentApi {
    private final AttachmentService attachmentService;

    @Override
    public Mono<ResponseEntity<DataEntityAttachments>> getAttachments(final Long dataEntityId,
                                                                      final ServerWebExchange exchange) {
        return attachmentService.getDataEntityAttachments(dataEntityId)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataEntityUploadOptions>> getUploadOptions(final Long dataEntityId,
                                                                          final ServerWebExchange exchange) {
        return attachmentService.getUploadOptions()
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataEntityUpload>> initiateFileUpload(final Long dataEntityId,
                                                                     final Mono<DataEntityUploadFormData> formDataMono,
                                                                     final ServerWebExchange exchange) {
        return formDataMono
            .flatMap(formData -> attachmentService.initiateFileUpload(formData, dataEntityId))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> uploadFileChunk(final Long dataEntityId,
                                                      final UUID uploadId,
                                                      final Mono<Part> fileMono,
                                                      final String index,
                                                      final ServerWebExchange exchange) {
        return fileMono
            .flatMap(file -> attachmentService.uploadFileChunk(uploadId, file, Integer.parseInt(index)))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataEntityFile>> completeFileUpload(final Long dataEntityId,
                                                                   final UUID uploadId,
                                                                   final ServerWebExchange exchange) {
        return attachmentService.completeFileUpload(uploadId)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Resource>> downloadFile(final Long dataEntityId,
                                                       final Long fileId,
                                                       final ServerWebExchange exchange) {
        return attachmentService.downloadFile(fileId).map(dto -> ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment;filename=" + dto.fileName())
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(dto.resource()));
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteFile(final Long dataEntityId,
                                                 final Long fileId,
                                                 final ServerWebExchange exchange) {
        return attachmentService.deleteFile(fileId)
            .thenReturn(ResponseEntity.noContent().build());
    }

    @Override
    public Mono<ResponseEntity<Flux<DataEntityLink>>> saveLinks(final Long dataEntityId,
                                                                final Mono<DataEntityLinkListFormData> formData,
                                                                final ServerWebExchange exchange) {
        return formData
            .map(fd -> attachmentService.saveLinks(dataEntityId, fd))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataEntityLink>> updateLink(final Long dataEntityId,
                                                           final Long linkId,
                                                           final Mono<DataEntityLinkFormData> dataEntityLinkFormData,
                                                           final ServerWebExchange exchange) {
        return dataEntityLinkFormData
            .flatMap(fd -> attachmentService.updateLink(linkId, fd))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteLink(final Long dataEntityId,
                                                 final Long linkId,
                                                 final ServerWebExchange exchange) {
        return attachmentService.deleteLink(linkId)
            .thenReturn(ResponseEntity.noContent().build());
    }
}
