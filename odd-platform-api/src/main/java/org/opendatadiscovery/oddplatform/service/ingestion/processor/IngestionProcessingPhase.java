package org.opendatadiscovery.oddplatform.service.ingestion.processor;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum IngestionProcessingPhase {
    INITIAL(1),
    MAIN(2),
    FINALIZING(3);

    @Getter
    private final int order;
}
