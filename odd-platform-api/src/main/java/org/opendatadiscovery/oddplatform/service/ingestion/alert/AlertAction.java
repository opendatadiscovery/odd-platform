package org.opendatadiscovery.oddplatform.service.ingestion.alert;

import java.util.List;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;

public abstract class AlertAction {
    public abstract int order();

    @RequiredArgsConstructor
    public static class CreateAlertAction extends AlertAction {
        @Getter
        private final AlertPojo alertPojo;

        @Override
        public int order() {
            return 1;
        }
    }

    @RequiredArgsConstructor
    public static class ResolveAutomaticallyAlertAction extends AlertAction {
        @Getter
        private final long alertId;

        @Override
        public int order() {
            return 1;
        }
    }

    @RequiredArgsConstructor
    public static class StackAlertAction extends AlertAction {
        @Getter
        private final long alertId;

        @Getter
        private final List<String> descriptions;

        @Override
        public int order() {
            // StackAlertActions must be executed after CreateAlertActions
            return 2;
        }
    }
}
