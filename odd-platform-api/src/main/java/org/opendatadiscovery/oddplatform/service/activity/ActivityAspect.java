package org.opendatadiscovery.oddplatform.service.activity;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityContextInfo;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityCreateEvent;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
@Aspect
@RequiredArgsConstructor
public class ActivityAspect {
    private final ActivityService activityService;

    @Pointcut("@annotation(ActivityLog)")
    private void activityLogMethod() {
    }

    @Pointcut("execution(reactor.core.publisher.Mono *(..))")
    private void monoMethod() {
    }

    @Pointcut("execution(reactor.core.publisher.Flux *(..))")
    private void fluxMethod() {
    }

    @Around("activityLogMethod() && monoMethod()")
    @ReactiveTransactional
    public Mono<?> monoActivityAspect(final ProceedingJoinPoint joinPoint) {
        final Map<String, Object> activityParameters = extractActivityParameters(joinPoint);
        final ActivityEventTypeDto eventType = extractEventType(joinPoint);
        return activityService.getContextInfo(activityParameters, eventType)
            .flatMap(info -> {
                try {
                    final Mono<Object> proceed = (Mono<Object>) joinPoint.proceed();
                    return proceed.flatMap(o -> postActivity(activityParameters, eventType, info).thenReturn(o))
                        .switchIfEmpty(postActivity(activityParameters, eventType, info));
                } catch (Throwable e) {
                    return Mono.error(e);
                }
            });
    }

    @Around("activityLogMethod() && fluxMethod()")
    @ReactiveTransactional
    public Flux<?> fluxActivityAspect(final ProceedingJoinPoint joinPoint) {
        final Map<String, Object> activityParameters = extractActivityParameters(joinPoint);
        final ActivityEventTypeDto eventType = extractEventType(joinPoint);
        return activityService.getContextInfo(activityParameters, eventType)
            .flatMapMany(info -> {
                try {
                    final Flux<Object> proceed = (Flux<Object>) joinPoint.proceed();
                    return proceed.collectList()
                        .flatMap(o -> postActivity(activityParameters, eventType, info).thenReturn(o))
                        .flatMapMany(Flux::fromIterable)
                        .switchIfEmpty(postActivity(activityParameters, eventType, info));
                } catch (Throwable e) {
                    return Flux.error(e);
                }
            });
    }

    private Mono<Void> postActivity(final Map<String, Object> activityParameters,
                                    final ActivityEventTypeDto eventType,
                                    final ActivityContextInfo info) {
        return activityService.getUpdatedInfo(activityParameters, info.getDataEntityId(), eventType)
            .map(newState -> ActivityCreateEvent.builder()
                .eventType(eventType)
                .dataEntityId(info.getDataEntityId())
                .oldState(info.getOldState())
                .newState(newState)
                .build())
            .flatMap(activityService::createActivityEvent);
    }

    private Map<String, Object> extractActivityParameters(final ProceedingJoinPoint joinPoint) {
        final Method method = ((MethodSignature) joinPoint.getSignature()).getMethod();
        final Parameter[] parameters = method.getParameters();
        int i = 0;
        final Map<String, Object> result = new HashMap<>();
        while (i < parameters.length) {
            final Parameter param = parameters[i];
            if (param.isAnnotationPresent(ActivityParameter.class)) {
                result.put(param.getAnnotation(ActivityParameter.class).value(), joinPoint.getArgs()[i]);
            }
            i++;
        }
        return result;
    }

    private ActivityEventTypeDto extractEventType(final ProceedingJoinPoint joinPoint) {
        final Method method = ((MethodSignature) joinPoint.getSignature()).getMethod();
        return method.getAnnotation(ActivityLog.class).value();
    }
}
