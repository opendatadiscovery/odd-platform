package org.opendatadiscovery.oddplatform.service.attachment.local;

import java.nio.file.Path;
import java.nio.file.Paths;
import javax.annotation.PostConstruct;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.service.attachment.FilePathConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(value = "attachment.storage", havingValue = "LOCAL", matchIfMissing = true)
public class LocalFilePathConstructor implements FilePathConstructor {
    @Value("${attachment.local.path}")
    private String basePath;

    @PostConstruct
    public void validate() {
        if (StringUtils.isEmpty(basePath)) {
            throw new IllegalStateException("Local base path property can't be empty");
        }
    }

    @Override
    public Path getFileDirectory(final long dataEntityId) {
        return Paths.get(basePath, String.valueOf(dataEntityId));
    }

    @Override
    public String getFilePath(final String fileName, final long dataEntityId) {
        return getFileDirectory(dataEntityId).resolve(fileName).toString();
    }
}
