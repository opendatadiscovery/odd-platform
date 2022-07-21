package org.opendatadiscovery.oddplatform.service.activity;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;

@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface ActivityLog {

    ActivityEventTypeDto event();

    boolean isSystemEvent() default false;
}
