package org.opendatadiscovery.oddplatform.utils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;
import lombok.experimental.UtilityClass;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.util.FileSystemUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.utils.BlockingOperationUtils.blockingOperation;
import static org.springframework.core.io.buffer.DefaultDataBufferFactory.sharedInstance;

@UtilityClass
public class FileUtils {
    private static final String CHUNK_BASE_PATH = "/tmp/odd/chunks";

    public static Path getChunkDirectory(final UUID uploadId) {
        return Paths.get(CHUNK_BASE_PATH, uploadId.toString());
    }

    public static Mono<Path> createDirectories(final Path path) {
        return blockingOperation(() -> Files.createDirectories(path)).thenReturn(path);
    }

    public static Flux<DataBuffer> readFile(final Path path) {
        return DataBufferUtils
            .readByteChannel(() -> Files.newByteChannel(path, StandardOpenOption.READ), sharedInstance, 1024);
    }

    public static Mono<Void> deleteDirectoryWithFiles(final Path path) {
        return blockingOperation(() -> FileSystemUtils.deleteRecursively(path));
    }

    public static List<Path> listFilesInOrder(final Path directory) {
        try (final Stream<Path> files = Files.list(directory)) {
            return files.sorted(Comparator.comparing(p -> Integer.parseInt(p.getFileName().toString()))).toList();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
