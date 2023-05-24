package org.opendatadiscovery.oddplatform.mapper;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityFile;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityUploadFormData;
import org.opendatadiscovery.oddplatform.model.tables.pojos.FilePojo;
import org.opendatadiscovery.oddplatform.service.attachment.FilePathConstructor;
import org.springframework.stereotype.Component;

import static org.opendatadiscovery.oddplatform.dto.FileUploadStatus.PROCESSING;

@Component
@RequiredArgsConstructor
public class FileMapper {
    private final FilePathConstructor pathConstructor;

    public DataEntityFile mapToDto(final FilePojo pojo) {
        final DataEntityFile file = new DataEntityFile();
        file.setId(pojo.getId());
        file.setName(pojo.getName());
        return file;
    }

    public FilePojo mapToProcessingPojo(final DataEntityUploadFormData fileMetadata,
                                        final UUID uploadId,
                                        final long dataEntityId) {
        final FilePojo filePojo = new FilePojo();
        filePojo.setDataEntityId(dataEntityId);
        filePojo.setName(fileMetadata.getFileName());
        filePojo.setPath(pathConstructor.getFilePath(fileMetadata.getFileName(), dataEntityId));
        filePojo.setUploadId(uploadId);
        filePojo.setStatus(PROCESSING.getCode());
        return filePojo;
    }
}
