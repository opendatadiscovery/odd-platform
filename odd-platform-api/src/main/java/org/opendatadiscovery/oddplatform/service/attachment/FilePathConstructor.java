package org.opendatadiscovery.oddplatform.service.attachment;

import java.nio.file.Path;

public interface FilePathConstructor {
    Path getFileDirectory(final long dataEntityId);

    String getFilePath(final String fileName, final long dataEntityId);
}
