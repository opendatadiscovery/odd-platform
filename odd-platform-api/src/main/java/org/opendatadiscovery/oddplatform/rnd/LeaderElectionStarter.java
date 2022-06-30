package org.opendatadiscovery.oddplatform.rnd;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LeaderElectionStarter {
    private final ExecutorService executorService = Executors.newCachedThreadPool();

    private final DataSourceProperties dataSourceProperties;
    private final WebhookSender webhookSender;

//    @EventListener(ApplicationReadyEvent.class)
    public void runLeaderElection() {
        executorService.submit(new LeaderElectionThread(dataSourceProperties, webhookSender));
    }
}
