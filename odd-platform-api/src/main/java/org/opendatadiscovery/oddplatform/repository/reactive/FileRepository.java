package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.UUID;
import org.opendatadiscovery.oddplatform.model.tables.pojos.FilePojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface FileRepository extends ReactiveCRUDRepository<FilePojo> {
    Mono<FilePojo> getFileByDataEntityAndName(final long dataEntityId, final String fileName);

    Mono<FilePojo> getFileByUploadId(final UUID uploadId);

    Flux<FilePojo> getDataEntityFiles(final long dataEntityId);
}
