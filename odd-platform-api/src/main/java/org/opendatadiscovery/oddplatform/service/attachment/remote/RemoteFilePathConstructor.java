package org.opendatadiscovery.oddplatform.service.attachment.remote;

import java.nio.file.Path;
import java.nio.file.Paths;
import org.opendatadiscovery.oddplatform.service.attachment.FilePathConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(value = "attachment.storage", havingValue = "REMOTE")
public class RemoteFilePathConstructor implements FilePathConstructor {
    @Override
    public Path getFileDirectory(final long dataEntityId) {
        return Paths.get(String.valueOf(dataEntityId));
    }

    @Override
    public String getFilePath(final String fileName, final long dataEntityId) {
        return getFileDirectory(dataEntityId).resolve(fileName).toString();
    }
}
