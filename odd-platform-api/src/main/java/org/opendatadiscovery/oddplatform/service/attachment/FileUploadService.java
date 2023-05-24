package org.opendatadiscovery.oddplatform.service.attachment;

import java.util.UUID;
import org.opendatadiscovery.oddplatform.model.tables.pojos.FilePojo;
import org.springframework.core.io.Resource;
import reactor.core.publisher.Mono;

public interface FileUploadService {
    Mono<UUID> initiateUpload(final long dataEntityId);

    Mono<Void> completeFileUpload(final FilePojo filePojo);

    Mono<Void> deleteFile(final FilePojo filePojo);

    Mono<Resource> downloadFile(final String path);
}
