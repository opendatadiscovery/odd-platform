package org.opendatadiscovery.oddplatform.service.ingestion.processor;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum IngestionProcessingPhase {
    MAIN(1),
    FINALIZING(2);

    @Getter
    private final int order;
}
