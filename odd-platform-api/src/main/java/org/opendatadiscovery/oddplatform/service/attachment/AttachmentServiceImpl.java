package org.opendatadiscovery.oddplatform.service.attachment;

import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityAttachments;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityFile;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLink;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLinkFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLinkListFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityUpload;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityUploadFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityUploadOptions;
import org.opendatadiscovery.oddplatform.dto.FileDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.codec.multipart.Part;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static reactor.function.TupleUtils.function;

@Service
@RequiredArgsConstructor
public class AttachmentServiceImpl implements AttachmentService {

    @Value("${attachment.max-file-size}")
    private Integer maxFileSize;

    private final LinkService linkService;
    private final FileService fileService;

    @Override
    public Mono<DataEntityAttachments> getDataEntityAttachments(final long dataEntityId) {
        final Mono<List<DataEntityFile>> dataEntityFiles = fileService.getDataEntityFiles(dataEntityId);
        final Mono<List<DataEntityLink>> dataEntityLinks = linkService.getDataEntityLinks(dataEntityId);
        return Mono.zip(dataEntityFiles, dataEntityLinks)
            .map(function((files, links) -> new DataEntityAttachments()
                .files(files)
                .links(links))
            );
    }

    @Override
    public Flux<DataEntityLink> saveLinks(final long dataEntityId, final DataEntityLinkListFormData formData) {
        return linkService.save(formData, dataEntityId);
    }

    @Override
    public Mono<DataEntityLink> updateLink(final long linkId, final DataEntityLinkFormData formData) {
        return linkService.update(linkId, formData);
    }

    @Override
    public Mono<Long> deleteLink(final long linkId) {
        return linkService.delete(linkId);
    }

    @Override
    public Mono<DataEntityUploadOptions> getUploadOptions() {
        return Mono.just(new DataEntityUploadOptions().maxSize(maxFileSize * 1_000_000));
    }

    @Override
    public Mono<DataEntityUpload> initiateFileUpload(final DataEntityUploadFormData fileMetadata,
                                                     final long dataEntityId) {
        return fileService.initiateFileUpload(fileMetadata, dataEntityId);
    }

    @Override
    public Mono<Void> uploadFileChunk(final UUID uploadId, final Part file, final int index) {
        return fileService.uploadFileChunk(uploadId, file, index);
    }

    @Override
    public Mono<DataEntityFile> completeFileUpload(final UUID uploadId) {
        return fileService.completeFileUpload(uploadId);
    }

    @Override
    public Mono<FileDto> downloadFile(final long fileId) {
        return fileService.downloadFile(fileId);
    }

    @Override
    public Mono<Long> deleteFile(final long fileId) {
        return fileService.deleteFile(fileId);
    }
}
