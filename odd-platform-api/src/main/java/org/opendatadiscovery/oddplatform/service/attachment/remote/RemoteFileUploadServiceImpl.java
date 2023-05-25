package org.opendatadiscovery.oddplatform.service.attachment.remote;

import io.minio.GetObjectArgs;
import io.minio.GetObjectResponse;
import io.minio.MinioAsyncClient;
import io.minio.ObjectWriteResponse;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import java.io.InputStream;
import java.nio.file.Path;
import java.util.UUID;
import javax.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.exception.MinioException;
import org.opendatadiscovery.oddplatform.model.tables.pojos.FilePojo;
import org.opendatadiscovery.oddplatform.service.attachment.FilePathConstructor;
import org.opendatadiscovery.oddplatform.service.attachment.FileUploadService;
import org.opendatadiscovery.oddplatform.utils.FileUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import reactor.util.function.Tuples;

import static reactor.function.TupleUtils.function;

@Service
@ConditionalOnProperty(value = "attachment.storage", havingValue = "REMOTE")
@RequiredArgsConstructor
public class RemoteFileUploadServiceImpl implements FileUploadService {
    @Value("${attachment.remote.bucket}")
    private String bucket;

    private final FilePathConstructor pathConstructor;
    private final MinioAsyncClient minioClient;

    @PostConstruct
    public void validate() {
        if (StringUtils.isEmpty(bucket)) {
            throw new IllegalStateException("Bucket can't be empty");
        }
    }

    @Override
    public Mono<UUID> initiateUpload(final long dataEntityId) {
        final UUID uploadId = UUID.randomUUID();
        final Path chunkDirectory = FileUtils.getChunkDirectory(uploadId);
        final Mono<Path> chunkMono = FileUtils.createDirectories(chunkDirectory);
        return chunkMono.thenReturn(uploadId);
    }

    @Override
    public Mono<Void> completeFileUpload(final FilePojo filePojo) {
        final Path chunkDirectory = FileUtils.getChunkDirectory(filePojo.getUploadId());
        final Flux<DataBuffer> chunksFlux = Flux.defer(() -> Mono.just(chunkDirectory)
            .flatMapIterable(FileUtils::listFilesInOrder)
            .flatMap(FileUtils::readFile)
            .subscribeOn(Schedulers.boundedElastic()));
        return DataBufferUtils.join(chunksFlux)
            .map(DataBuffer::asInputStream)
            .flatMap(stream -> getStreamSize(stream).map(size -> Tuples.of(stream, size)))
            .map(function((stream, size) -> PutObjectArgs.builder()
                .bucket(bucket)
                .object(pathConstructor.getFilePath(filePojo.getName(), filePojo.getDataEntityId()))
                .stream(stream, size, -1)
                .build()))
            .flatMap(this::putObject)
            .then(FileUtils.deleteDirectoryWithFiles(chunkDirectory));
    }

    @Override
    public Mono<Void> deleteFile(final FilePojo filePojo) {
        final RemoveObjectArgs args = RemoveObjectArgs.builder()
            .bucket(bucket)
            .object(filePojo.getPath())
            .build();
        return removeObject(args);
    }

    @Override
    public Mono<Resource> downloadFile(final String filePath) {
        final GetObjectArgs args = GetObjectArgs.builder()
            .bucket(bucket)
            .object(filePath)
            .build();
        return getObject(args)
            .map(InputStreamResource::new);
    }

    private Mono<ObjectWriteResponse> putObject(final PutObjectArgs args) {
        return Mono.fromFuture(() -> {
            try {
                return minioClient.putObject(args);
            } catch (Exception e) {
                throw new MinioException(e);
            }
        });
    }

    private Mono<GetObjectResponse> getObject(final GetObjectArgs args) {
        return Mono.fromFuture(() -> {
            try {
                return minioClient.getObject(args);
            } catch (Exception e) {
                throw new MinioException(e);
            }
        });
    }

    private Mono<Void> removeObject(final RemoveObjectArgs args) {
        return Mono.fromFuture(() -> {
            try {
                return minioClient.removeObject(args);
            } catch (Exception e) {
                throw new MinioException(e);
            }
        });
    }

    private Mono<Integer> getStreamSize(final InputStream inputStream) {
        return Mono.fromCallable(inputStream::available).subscribeOn(Schedulers.boundedElastic());
    }
}
