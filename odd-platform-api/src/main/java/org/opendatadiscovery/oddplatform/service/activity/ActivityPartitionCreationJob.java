package org.opendatadiscovery.oddplatform.service.activity;

import javax.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ActivityPartitionCreationJob {
    private final ActivityTablePartitionManager partitionManager;

    @PostConstruct
    public void init() {
        partitionManager.createPartitionsIfNotExists();
    }

    @Scheduled(cron = "0 1 0 * * *")
    public void run() {
        log.debug("Running partition creation job");
        partitionManager.createPartitionsIfNotExists();
    }
}
