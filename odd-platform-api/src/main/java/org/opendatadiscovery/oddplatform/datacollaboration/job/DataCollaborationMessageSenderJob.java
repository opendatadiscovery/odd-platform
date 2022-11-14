package org.opendatadiscovery.oddplatform.datacollaboration.job;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.datacollaboration.config.DataCollaborationProperties;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.DataEntityMessageContext;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.datacollaboration.exception.DataCollaborationMessageSenderException;
import org.opendatadiscovery.oddplatform.datacollaboration.repository.DataCollaborationRepository;
import org.opendatadiscovery.oddplatform.datacollaboration.repository.DataCollaborationRepositoryFactory;
import org.opendatadiscovery.oddplatform.datacollaboration.service.MessageProviderClient;
import org.opendatadiscovery.oddplatform.datacollaboration.service.MessageProviderClientFactory;
import org.opendatadiscovery.oddplatform.leaderelection.PostgreSQLLeaderElectionManager;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;

@RequiredArgsConstructor
@Slf4j
public class DataCollaborationMessageSenderJob extends Thread {
    private final PostgreSQLLeaderElectionManager leaderElectionManager;
    private final MessageProviderClientFactory messageProviderClientFactory;
    private final DataCollaborationProperties dataCollaborationProperties;
    private final DataCollaborationRepositoryFactory dataCollaborationRepositoryFactory;

    @Override
    public void run() {
        while (!Thread.interrupted()) {
            try (final Connection connection = acquireLeaderElectionConnection()) {
                final DataCollaborationRepository dataCollaborationRepository =
                    dataCollaborationRepositoryFactory.create(DSL.using(connection));

                while (true) {
                    final Optional<DataEntityMessageContext> sendingCandidate =
                        dataCollaborationRepository.getSendingCandidate();

                    if (sendingCandidate.isPresent()) {
                        final DataEntityMessageContext messageCtx = sendingCandidate.get();
                        final MessagePojo message = messageCtx.message();

                        final MessageProviderClient messageProviderClient = messageProviderClientFactory
                            .getOrFail(MessageProviderDto.valueOf(message.getProvider()));

                        final String messageTs;
                        try {
                            messageTs = messageProviderClient.postMessage(messageCtx).block();
                        } catch (final Exception e) {
                            log.error("Couldn't send a message to {}: {}", message.getProvider(), e.getMessage());
                            dataCollaborationRepository.markMessageAsFailed(message.getUuid(), e.getMessage());
                            continue;
                        }

                        dataCollaborationRepository.enrichMessage(message.getUuid(), message.getCreatedAt(), messageTs);
                    }

                    TimeUnit.SECONDS.sleep(1);
                }
            } catch (final InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new DataCollaborationMessageSenderException(e);
            } catch (final Exception e) {
                log.error("Error occurred while a data collaboration message sender job was running", e);
            }

            log.debug("Released a lock, waiting 10 seconds for next iteration");
            try {
                TimeUnit.SECONDS.sleep(10);
            } catch (final InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new DataCollaborationMessageSenderException(e);
            }
        }
    }

    private Connection acquireLeaderElectionConnection() throws SQLException {
        return leaderElectionManager.acquire(dataCollaborationProperties.getSenderMessageAdvisoryLockId(), true);
    }
}