package org.opendatadiscovery.oddplatform.datacollaboration.config;

import com.slack.api.Slack;
import com.slack.api.methods.AsyncMethodsClient;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.datacollaboration.client.SlackAPIClient;
import org.opendatadiscovery.oddplatform.datacollaboration.client.SlackAPIClientImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
@ConditionalOnDataCollaboration
@EnableConfigurationProperties(DataCollaborationProperties.class)
public class DataCollaborationConfiguration {
    @Bean
    public SlackAPIClient slackAPIClient(
        @Value("${datacollaboration.slack-oauth-token}") final String slackOauthToken
    ) {
        if (StringUtils.isEmpty(slackOauthToken)) {
            throw new IllegalArgumentException("Slack OAuth token is empty");
        }

        final AsyncMethodsClient asyncMethodsClient = Slack.getInstance().methodsAsync(slackOauthToken);

        return new SlackAPIClientImpl(asyncMethodsClient);
    }
}