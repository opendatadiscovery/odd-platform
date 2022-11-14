package org.opendatadiscovery.oddplatform.datacollaboration.job;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.datacollaboration.config.ConditionalOnDataCollaboration;
import org.opendatadiscovery.oddplatform.datacollaboration.config.DataCollaborationProperties;
import org.opendatadiscovery.oddplatform.datacollaboration.repository.DataCollaborationRepositoryFactory;
import org.opendatadiscovery.oddplatform.datacollaboration.service.MessageProviderEventHandlerFactory;
import org.opendatadiscovery.oddplatform.leaderelection.PostgreSQLLeaderElectionManager;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnDataCollaboration
@RequiredArgsConstructor
@Slf4j
public class DataCollaborationMessageEventProcessorStarter {
    private final ExecutorService executorService = Executors.newSingleThreadExecutor(
        r -> new Thread(r, "data-collaboration-process-message-events-thread")
    );

    private final PostgreSQLLeaderElectionManager leaderElectionManager;
    private final MessageProviderEventHandlerFactory messageProviderEventHandlerFactory;
    private final DataCollaborationProperties dataCollaborationProperties;
    private final DataCollaborationRepositoryFactory dataCollaborationRepositoryFactory;

    @EventListener(ApplicationReadyEvent.class)
    public void runDataCollaborationEventProcessor() {
        log.debug("Data Collaboration message event processor is enabled");
        executorService.submit(new DataCollaborationMessageEventProcessor(
            leaderElectionManager,
            messageProviderEventHandlerFactory,
            dataCollaborationProperties,
            dataCollaborationRepositoryFactory
        ));
    }
}