package org.opendatadiscovery.oddplatform.service.ingestion.alert;

import java.util.List;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertChunkPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;

import static java.util.Collections.singletonList;

public abstract class AlertAction {
    @RequiredArgsConstructor
    public static class CreateAlertAction extends AlertAction {
        @Getter
        private final AlertPojo alertPojo;

        @Getter
        private final List<String> chunks;
    }

    @RequiredArgsConstructor
    public static class ResolveAutomaticallyAlertAction extends AlertAction {
        @Getter
        private final long alertId;
    }

    @RequiredArgsConstructor
    public static class StackAlertAction extends AlertAction {
        @Getter
        private final List<AlertChunkPojo> chunks;

        public StackAlertAction(final AlertChunkPojo singleChunk) {
            this(singletonList(singleChunk));
        }
    }
}
