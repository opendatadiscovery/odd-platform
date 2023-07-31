package org.opendatadiscovery.oddplatform.service.job;

import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityStatusEnum;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.service.DataEntityInternalStateService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataEntityStatusSwitchJob {
    private final DataEntityInternalStateService internalStateService;
    private final ReactiveDataEntityRepository dataEntityRepository;

    @Scheduled(fixedRate = 10, timeUnit = TimeUnit.MINUTES)
    @SchedulerLock(name = "statusSwitchJob", lockAtLeastFor = "9m", lockAtMostFor = "9m")
    public void run() {
        final DataEntityStatus status = new DataEntityStatus(DataEntityStatusEnum.DELETED);
        dataEntityRepository.getPojosForStatusSwitch()
            .collectList()
            .filter(CollectionUtils::isNotEmpty)
            .flatMap(pojos -> internalStateService.changeStatusForDataEntities(pojos, status))
            .block();
    }
}
