package org.opendatadiscovery.oddplatform.datacollaboration.config;

import com.slack.api.Slack;
import com.slack.api.methods.AsyncMethodsClient;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.datacollaboration.client.SlackAPIClient;
import org.opendatadiscovery.oddplatform.datacollaboration.client.SlackAPIClientImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(value = "datacollaboration.enabled", havingValue = "true")
public class DataCollaborationConfig {
    @Bean
    public AsyncMethodsClient slackAsyncMethodsClient(
        @Value("${datacollaboration.slack-oauth-token}") final String slackOauthToken
    ) {
        if (StringUtils.isEmpty(slackOauthToken)) {
            throw new IllegalArgumentException("Slack OAuth token is empty");
        }

        return Slack.getInstance().methodsAsync(slackOauthToken);
    }

    @Bean
    public SlackAPIClient slackAPIClient(final AsyncMethodsClient asyncMethodsClient) {
        return new SlackAPIClientImpl(asyncMethodsClient);
    }
}
