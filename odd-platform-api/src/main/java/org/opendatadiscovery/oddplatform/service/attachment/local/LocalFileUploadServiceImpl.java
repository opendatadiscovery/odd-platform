package org.opendatadiscovery.oddplatform.service.attachment.local;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.model.tables.pojos.FilePojo;
import org.opendatadiscovery.oddplatform.service.attachment.FilePathConstructor;
import org.opendatadiscovery.oddplatform.service.attachment.FileUploadService;
import org.opendatadiscovery.oddplatform.utils.FileUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import static org.opendatadiscovery.oddplatform.utils.BlockingOperationUtils.blockingOperation;

@Service
@ConditionalOnProperty(value = "attachment.storage", havingValue = "LOCAL", matchIfMissing = true)
@RequiredArgsConstructor
public class LocalFileUploadServiceImpl implements FileUploadService {
    private final FilePathConstructor pathConstructor;

    @Override
    public Mono<UUID> initiateUpload(final long dataEntityId) {
        final UUID uploadId = UUID.randomUUID();
        final Path chunkDirectory = FileUtils.getChunkDirectory(uploadId);
        final Path fileDirectory = pathConstructor.getFileDirectory(dataEntityId);

        final Mono<Path> chunkMono = FileUtils.createDirectories(chunkDirectory);
        final Mono<Path> fileMono = FileUtils.createDirectories(fileDirectory);
        return Mono.zip(chunkMono, fileMono)
            .thenReturn(uploadId);
    }

    @Override
    public Mono<Void> completeFileUpload(final FilePojo filePojo) {
        final Path chunkDirectory = FileUtils.getChunkDirectory(filePojo.getUploadId());
        final Flux<DataBuffer> chunksFlux = Flux.defer(() -> Mono.just(chunkDirectory)
            .flatMapIterable(FileUtils::listFilesInOrder)
            .flatMap(FileUtils::readFile)
            .subscribeOn(Schedulers.boundedElastic()));
        return DataBufferUtils.write(chunksFlux, Path.of(filePojo.getPath()))
            .then(FileUtils.deleteDirectoryWithFiles(chunkDirectory));
    }

    @Override
    public Mono<Void> deleteFile(final FilePojo filePojo) {
        return blockingOperation(() -> {
            Files.delete(Paths.get(filePojo.getPath()));
            return null;
        });
    }

    @Override
    public Mono<Resource> downloadFile(final String path) {
        final Flux<DataBuffer> fileChunks = FileUtils.readFile(Paths.get(path));
        return DataBufferUtils.join(fileChunks)
            .map(DataBuffer::asInputStream)
            .map(InputStreamResource::new);
    }
}
