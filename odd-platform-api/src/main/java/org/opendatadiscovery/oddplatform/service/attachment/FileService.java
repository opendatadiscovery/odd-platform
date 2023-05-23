package org.opendatadiscovery.oddplatform.service.attachment;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityFile;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityUpload;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityUploadFormData;
import org.opendatadiscovery.oddplatform.dto.FileDto;
import org.springframework.http.codec.multipart.Part;
import reactor.core.publisher.Mono;

public interface FileService {
    Mono<List<DataEntityFile>> getDataEntityFiles(final long dataEntityId);

    Mono<DataEntityUpload> initiateFileUpload(final DataEntityUploadFormData fileMetadata,
                                              final long dataEntityId);

    Mono<Void> uploadFileChunk(final String uploadId, final Part file, final int index);

    Mono<DataEntityFile> completeFileUpload(final String uploadId);

    Mono<Long> deleteFile(final long fileId);

    Mono<FileDto> downloadFile(final long fileId);
}
