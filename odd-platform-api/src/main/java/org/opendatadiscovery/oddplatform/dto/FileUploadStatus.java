package org.opendatadiscovery.oddplatform.dto;

import java.util.Arrays;
import java.util.Optional;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum FileUploadStatus {
    PROCESSING(1),
    COMPLETED(2);

    @Getter
    private final short code;

    FileUploadStatus(final int code) {
        this.code = ((short) code);
    }

    public static Optional<FileUploadStatus> fromCode(final short code) {
        return Arrays.stream(FileUploadStatus.values())
            .filter(s -> s.getCode() == code)
            .findFirst();
    }
}

