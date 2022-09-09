package org.opendatadiscovery.oddplatform.service.sla;

import java.util.List;
import lombok.Getter;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestSeverity;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetSLAReport;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetSLASeverityWeight;
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
        if (counter.getMajorsCount() > 0) {
            criticalCount = counter.getMajorsCount() * counter.getCriticalCount();
            successWeight += counter.getMajorsCount() * counter.getCriticalSuccess();
        } else if (counter.getMinorsCount() > 0) {
            criticalCount = counter.getMinorsCount() * counter.getCriticalCount();
            successWeight += counter.getMinorsCount() * counter.getCriticalSuccess();
        } else {
            criticalCount = counter.getCriticalCount();
            successWeight += counter.getCriticalSuccess();
        }
        totalWeight += criticalCount;
        result.addSeverityWeightsItem(new DataSetSLASeverityWeight().severity(CRITICAL).count(majorsCount));

        result.setTotal(totalWeight);
        result.setSuccess(successWeight);
        result.setSlaRef("/api/datasets/%s/sla".formatted(datasetId));

        return result;
    }

    public SLA calculateSLA(final List<TestStatusWithSeverityDto> tests) {
        final List<TestStatusWithSeverityDto> countableTests = tests.stream()
            .filter(t -> t.status() == QualityRunStatus.SUCCESS || t.status() == QualityRunStatus.FAILED)
            .toList();

        if (countableTests.isEmpty()) {
            return SLA.YELLOW;
        }

        long failedMajor = 0;
        long failedMinor = 0;

        long totalMajor = 0;
        long totalMinor = 0;

        for (final TestStatusWithSeverityDto test : countableTests) {
            if (test.status() != QualityRunStatus.SUCCESS) {
                if (test.severity() == DataQualityTestSeverity.CRITICAL) {
                    return SLA.RED;
                }

                if (test.severity() == DataQualityTestSeverity.MAJOR) {
                    failedMajor++;
                }

                if (test.severity() == DataQualityTestSeverity.MINOR) {
                    failedMinor++;
                }
            }

            if (test.severity() == DataQualityTestSeverity.MAJOR) {
                totalMajor++;
            }

            if (test.severity() == DataQualityTestSeverity.MINOR) {
                totalMinor++;
            }
        }

        if (totalMajor != 0 && failedMajor == totalMajor) {
            return SLA.RED;
        }

        if (failedMajor + 1 == totalMajor && failedMinor == totalMinor) {
            return SLA.RED;
        }

        if (failedMajor > 0) {
            return SLA.YELLOW;
        }

        if (failedMinor == totalMinor) {
            return SLA.YELLOW;
        }

        return SLA.GREEN;
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
