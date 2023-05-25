package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.UUID;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.FileUploadStatus;
import org.opendatadiscovery.oddplatform.model.tables.pojos.FilePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.FileRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.FILE;

@Repository
public class FileRepositoryImpl extends ReactiveAbstractSoftDeleteCRUDRepository<FileRecord, FilePojo>
    implements FileRepository {

    public FileRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                              final JooqQueryHelper jooqQueryHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, FILE, FilePojo.class);
    }

    @Override
    public Mono<FilePojo> getFileByDataEntityAndName(final long dataEntityId, final String fileName) {
        final var query = DSL.selectFrom(FILE)
            .where(addSoftDeleteFilter(FILE.DATA_ENTITY_ID.eq(dataEntityId).and(FILE.NAME.eq(fileName))));
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(FilePojo.class));
    }

    @Override
    public Mono<FilePojo> getFileByUploadId(final UUID uploadId) {
        final var query = DSL.selectFrom(FILE)
            .where(addSoftDeleteFilter(FILE.UPLOAD_ID.eq(uploadId)));
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(FilePojo.class));
    }

    @Override
    public Flux<FilePojo> getDataEntityFiles(final long dataEntityId) {
        final var query = DSL.selectFrom(FILE)
            .where(addSoftDeleteFilter(FILE.DATA_ENTITY_ID.eq(dataEntityId)
                .and(FILE.STATUS.eq(FileUploadStatus.COMPLETED.getCode()))));
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(FilePojo.class));
    }
}
