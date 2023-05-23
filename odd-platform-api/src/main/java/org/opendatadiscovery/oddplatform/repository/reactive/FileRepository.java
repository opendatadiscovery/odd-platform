package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.model.tables.pojos.FilePojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface FileRepository extends ReactiveCRUDRepository<FilePojo> {
    Mono<FilePojo> getFileByDataEntityAndName(final long dataEntityId, final String fileName);

    Mono<FilePojo> getFileByUploadId(final String uploadId);

    Flux<FilePojo> getDataEntityFiles(final long dataEntityId);
}
