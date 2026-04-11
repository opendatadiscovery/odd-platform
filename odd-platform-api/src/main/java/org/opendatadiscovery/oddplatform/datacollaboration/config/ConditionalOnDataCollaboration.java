package org.opendatadiscovery.oddplatform.datacollaboration.config;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.context.annotation.Conditional;

@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Conditional(DataCollaborationFeatureCondition.class)
public @interface ConditionalOnDataCollaboration {
    boolean enabled() default true;
}
