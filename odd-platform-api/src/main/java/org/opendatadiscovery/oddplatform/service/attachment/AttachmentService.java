package org.opendatadiscovery.oddplatform.service.attachment;

import java.util.UUID;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityAttachments;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityFile;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLink;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLinkFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLinkListFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityUpload;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityUploadFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityUploadOptions;
import org.opendatadiscovery.oddplatform.dto.FileDto;
import org.springframework.http.codec.multipart.Part;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface AttachmentService {
    Mono<DataEntityAttachments> getDataEntityAttachments(final long dataEntityId);

    Flux<DataEntityLink> saveLinks(final long dataEntityId, final DataEntityLinkListFormData formData);

    Mono<DataEntityLink> updateLink(final long linkId, final DataEntityLinkFormData formData);

    Mono<Long> deleteLink(final long linkId);

    Mono<DataEntityUploadOptions> getUploadOptions();

    Mono<DataEntityUpload> initiateFileUpload(final DataEntityUploadFormData fileMetadata, final long dataEntityId);

    Mono<Void> uploadFileChunk(final UUID uploadId, final Part file, final int index);

    Mono<DataEntityFile> completeFileUpload(final UUID uploadId);

    Mono<FileDto> downloadFile(final long fileId);

    Mono<Long> deleteFile(final long fileId);
}
