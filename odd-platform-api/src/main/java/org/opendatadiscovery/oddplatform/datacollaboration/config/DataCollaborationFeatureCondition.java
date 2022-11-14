package org.opendatadiscovery.oddplatform.datacollaboration.config;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import org.opendatadiscovery.oddplatform.service.feature.FeatureResolver;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.util.MultiValueMap;

public class DataCollaborationFeatureCondition implements Condition {
    @SuppressWarnings("ConstantConditions")
    @Override
    public boolean matches(final ConditionContext context, final AnnotatedTypeMetadata metadata) {
        final OffsetDateTime offsetDateTime = OffsetDateTime.now().withOffsetSameInstant(ZoneOffset.UTC);

        final MultiValueMap<String, Object> attributes =
            metadata.getAllAnnotationAttributes(ConditionalOnDataCollaboration.class.getName());

        final boolean enableParameter = attributes == null || (boolean) attributes.getFirst("enabled");

        final boolean featureEnabled = context
            .getEnvironment()
            .getProperty(FeatureResolver.DATA_COLLABORATION_ENABLED_PROPERTY, Boolean.class, false);

        return enableParameter == featureEnabled;
    }
}