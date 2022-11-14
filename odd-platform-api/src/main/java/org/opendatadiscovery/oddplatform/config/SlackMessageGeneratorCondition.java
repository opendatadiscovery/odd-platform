package org.opendatadiscovery.oddplatform.config;

import org.opendatadiscovery.oddplatform.datacollaboration.config.DataCollaborationFeatureCondition;
import org.opendatadiscovery.oddplatform.notification.config.NotificationsFeatureCondition;
import org.springframework.boot.autoconfigure.condition.AnyNestedCondition;
import org.springframework.context.annotation.Conditional;

public class SlackMessageGeneratorCondition extends AnyNestedCondition {
    public SlackMessageGeneratorCondition() {
        super(ConfigurationPhase.REGISTER_BEAN);
    }

    @Conditional(DataCollaborationFeatureCondition.class)
    static class DataCollaboration {
    }

    @Conditional(NotificationsFeatureCondition.class)
    static class Notifications {
    }
}
