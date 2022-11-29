package org.opendatadiscovery.oddplatform.service.ingestion.alert;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;

public abstract class AlertAction {
    public abstract ActionType getActionType();

    // TODO: MessageEventActionDto is similar
    public enum ActionType {
        INSERT,
        UPDATE
    }

    @RequiredArgsConstructor
    public static class CreateAlertAction extends AlertAction {
        @Getter
        private final AlertPojo alertPojo;

        @Override
        public ActionType getActionType() {
            return ActionType.INSERT;
        }
    }

    @RequiredArgsConstructor
    public static class ResolveAutomaticallyAlertAction extends AlertAction {
        @Getter
        private final long alertId;

        @Override
        public ActionType getActionType() {
            return ActionType.UPDATE;
        }
    }

    @RequiredArgsConstructor
    public static class StackAlertAction extends AlertAction {
        @Getter
        private final long alertId;

        @Getter
        private final List<LocalDateTime> time;

        @Override
        public ActionType getActionType() {
            return ActionType.UPDATE;
        }
    }
}
