package org.opendatadiscovery.oddplatform.service.sla;

import java.util.List;
import lombok.Getter;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestSeverity;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetSLAReport;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetSLASeverityWeight;
import org.opendatadiscovery.oddplatform.api.contract.model.SLAColour;
import org.opendatadiscovery.oddplatform.dto.SLA;
import org.opendatadiscovery.oddplatform.dto.TestStatusWithSeverityDto;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.QualityRunStatus;
import org.springframework.stereotype.Component;

import static org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestSeverity.CRITICAL;
import static org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestSeverity.MAJOR;
import static org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestSeverity.MINOR;

@Component
public class SLACalculator {

    public DataSetSLAReport getSLAReport(final long datasetId,
                                         final List<TestStatusWithSeverityDto> tests) {
        final Counter counter = new Counter();
        tests.stream()
            .filter(t -> t.status() == QualityRunStatus.SUCCESS || t.status() == QualityRunStatus.FAILED)
            .forEach(counter::add);

        final DataSetSLAReport result = new DataSetSLAReport();

        long totalWeight = 0;
        long successWeight = 0;

        totalWeight += counter.getMinorsCount();
        successWeight += counter.getMinorsSuccess();
        result.addSeverityWeightsItem(new DataSetSLASeverityWeight().severity(MINOR).count(counter.getMinorsCount()));

        final long majorsCount;
        if (counter.getMinorsCount() > 0) {
            majorsCount = counter.getMinorsCount() * counter.getMajorsCount();
            successWeight += counter.getMinorsCount() * counter.getMajorsSuccess();
        } else {
            majorsCount = counter.getMajorsCount();
            successWeight += counter.getMajorsSuccess();
        }
        totalWeight += majorsCount;
        result.addSeverityWeightsItem(new DataSetSLASeverityWeight().severity(MAJOR).count(majorsCount));

        final long criticalCount;
        if (majorsCount > 0) {
            criticalCount = majorsCount * counter.getCriticalCount();
            successWeight += majorsCount * counter.getCriticalSuccess();
        } else if (counter.getMinorsCount() > 0) {
            criticalCount = counter.getMinorsCount() * counter.getCriticalCount();
            successWeight += counter.getMinorsCount() * counter.getCriticalSuccess();
        } else {
            criticalCount = counter.getCriticalCount();
            successWeight += counter.getCriticalSuccess();
        }
        totalWeight += criticalCount;
        result.addSeverityWeightsItem(new DataSetSLASeverityWeight().severity(CRITICAL).count(criticalCount));

        result.setTotal(totalWeight);
        result.setSuccess(successWeight);
        result.setSlaRef("/api/datasets/%s/sla".formatted(datasetId));

        final SLA slaColour = getSLAColour(counter);
        result.setSlaColour(SLAColour.fromValue(slaColour.name()));

        return result;
    }

    public SLA calculateSLA(final List<TestStatusWithSeverityDto> tests) {
        final Counter counter = new Counter();
        tests.stream()
            .filter(t -> t.status() == QualityRunStatus.SUCCESS || t.status() == QualityRunStatus.FAILED)
            .forEach(counter::add);
        return getSLAColour(counter);
    }

    private SLA getSLAColour(final Counter counter) {
        if (counter.getMinorsCount() == 0 && counter.getMajorsCount() == 0 && counter.getCriticalCount() == 0) {
            return SLA.YELLOW;
        }
        if (anyCriticalFailed(counter)) {
            return SLA.RED;
        }
        if (allMajorsFailed(counter)) {
            return SLA.RED;
        }
        if (allExceptOneMajorsFailedAndAllMinorsFailed(counter)) {
            return SLA.RED;
        }
        if (hasFailedMajors(counter)) {
            return SLA.YELLOW;
        }
        if (allMinorsFailed(counter)) {
            return SLA.YELLOW;
        }
        return SLA.GREEN;
    }

    private boolean anyCriticalFailed(final Counter counter) {
        return counter.getCriticalCount() != counter.getCriticalSuccess();
    }

    private boolean allMajorsFailed(final Counter counter) {
        return counter.getMajorsCount() != 0 && counter.getMajorsSuccess() == 0;
    }

    private boolean allExceptOneMajorsFailedAndAllMinorsFailed(final Counter counter) {
        return counter.getMajorsCount() != 0 && counter.getMajorsSuccess() == 1 && counter.getMinorsCount() != 0
            && counter.getMinorsSuccess() == 0;
    }

    private boolean hasFailedMajors(final Counter counter) {
        return counter.getMajorsCount() != counter.getMajorsSuccess();
    }

    private boolean allMinorsFailed(final Counter counter) {
        return counter.getMinorsCount() != 0 && counter.getMinorsSuccess() == 0;
    }

    @Getter
    private static class Counter {
        private long minorsCount = 0;
        private long majorsCount = 0;
        private long criticalCount = 0;

        private long minorsSuccess = 0;
        private long majorsSuccess = 0;
        private long criticalSuccess = 0;

        void add(final TestStatusWithSeverityDto dto) {
            if (dto.severity() == MINOR) {
                minorsCount++;
                if (dto.status() == QualityRunStatus.SUCCESS) {
                    minorsSuccess++;
                }
            } else if (dto.severity() == DataQualityTestSeverity.MAJOR) {
                majorsCount++;
                if (dto.status() == QualityRunStatus.SUCCESS) {
                    majorsSuccess++;
                }
            } else {
                criticalCount++;
                if (dto.status() == QualityRunStatus.SUCCESS) {
                    criticalSuccess++;
                }
            }
        }
    }
}
