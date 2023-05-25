package org.opendatadiscovery.oddplatform.utils;

import java.util.concurrent.Callable;
import lombok.experimental.UtilityClass;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@UtilityClass
public class BlockingOperationUtils {

    public static Mono<Void> blockingOperation(final Callable<?> callable) {
        return Mono.<Void>create(sink -> {
            try {
                callable.call();
                sink.success();
            } catch (Exception ex) {
                sink.error(ex);
            }
        })
        .subscribeOn(Schedulers.boundedElastic());
    }
}
