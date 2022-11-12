package org.opendatadiscovery.oddplatform.config;

import java.net.URL;
import org.opendatadiscovery.oddplatform.notification.processor.message.SlackMessageGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;

@Configuration
@Conditional(SlackMessageGeneratorCondition.class)
public class SlackMessageGeneratorConfiguration {
    @Bean
    public SlackMessageGenerator slackNotificationMessageGenerator(
        @Value("${odd.platform-base-url}") final URL platformBaseUrl
    ) {
        return new SlackMessageGenerator(platformBaseUrl);
    }
}