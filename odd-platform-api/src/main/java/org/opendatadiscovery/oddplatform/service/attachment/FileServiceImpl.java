package org.opendatadiscovery.oddplatform.service.attachment;

import java.nio.file.Path;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityFile;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityUpload;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityUploadFormData;
import org.opendatadiscovery.oddplatform.dto.FileDto;
import org.opendatadiscovery.oddplatform.dto.FileUploadStatus;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.FileMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.FilePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.FileRepository;
import org.opendatadiscovery.oddplatform.utils.FileUtils;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.http.codec.multipart.Part;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.dto.FileUploadStatus.PROCESSING;

@Service
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {
    private final FileUploadService fileUploadService;
    private final FileRepository fileRepository;
    private final FileMapper fileMapper;

    @Override
    public Mono<List<DataEntityFile>> getDataEntityFiles(final long dataEntityId) {
        return fileRepository.getDataEntityFiles(dataEntityId)
            .map(fileMapper::mapToDto)
            .collectList();
    }

    @Override
    public Mono<DataEntityUpload> initiateFileUpload(final DataEntityUploadFormData fileMetadata,
                                                     final long dataEntityId) {
        final Mono<DataEntityUpload> uploadMono = Mono.defer(() -> fileUploadService.initiateUpload(dataEntityId)
            .map(uploadId -> fileMapper.mapToProcessingPojo(fileMetadata, uploadId, dataEntityId))
            .flatMap(fileRepository::create)
            .map(pojo -> new DataEntityUpload().id(pojo.getUploadId())));
        return fileRepository.getFileByDataEntityAndName(dataEntityId, fileMetadata.getFileName())
            .handle((pojo, sink) -> {
                if (pojo != null) {
                    sink.error(new BadUserRequestException(
                        "File with name %s already exists for this data entity".formatted(fileMetadata.getFileName())));
                }
            })
            .then(uploadMono);
    }

    @Override
    public Mono<Void> uploadFileChunk(final UUID uploadId, final Part file, final int index) {
        if (file instanceof FilePart filePart) {
            final Path chunkDirectory = FileUtils.getChunkDirectory(uploadId);
            final Mono<Void> uploadedMono = Mono.defer(() -> Mono.just(chunkDirectory)
                .flatMap(path -> filePart.transferTo(path.resolve(String.valueOf(index)))));
            return checkProcessingUploadById(uploadId).then(uploadedMono);
        } else {
            return Mono.error(new BadUserRequestException("Uploaded multipart is not a file"));
        }
    }

    @Override
    public Mono<DataEntityFile> completeFileUpload(final UUID uploadId) {
        return checkProcessingUploadById(uploadId)
            .flatMap(pojo -> fileUploadService.completeFileUpload(pojo).thenReturn(pojo))
            .map(pojo -> pojo.setStatus(FileUploadStatus.COMPLETED.getCode()))
            .flatMap(fileRepository::update)
            .map(fileMapper::mapToDto);
    }

    @Override
    @ReactiveTransactional
    public Mono<Long> deleteFile(final long fileId) {
        return fileRepository.delete(fileId)
            .flatMap(pojo -> fileUploadService.deleteFile(pojo).thenReturn(pojo.getId()));
    }

    @Override
    public Mono<FileDto> downloadFile(final long fileId) {
        return fileRepository.get(fileId)
            .switchIfEmpty(Mono.error(new NotFoundException("File", fileId)))
            .flatMap(pojo -> fileUploadService.downloadFile(pojo.getPath())
                .map(r -> new FileDto(r, pojo.getName())));
    }

    private Mono<FilePojo> checkProcessingUploadById(final UUID uploadId) {
        return fileRepository.getFileByUploadId(uploadId).handle((pojo, sink) -> {
            if (!pojo.getStatus().equals(PROCESSING.getCode())) {
                sink.error(
                    new BadUserRequestException("There is no processing upload with id %s".formatted(uploadId)));
            } else {
                sink.next(pojo);
            }
        });
    }
}
