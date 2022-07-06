package org.opendatadiscovery.oddplatform.service.sla;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestSeverity;
import org.opendatadiscovery.oddplatform.dto.SLA;
import org.opendatadiscovery.oddplatform.dto.TestStatusWithSeverityDto;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.QualityRunStatus;
import org.springframework.stereotype.Component;

@Component
public class SLACalculator {
    public SLA calculateSLA(final List<TestStatusWithSeverityDto> tests) {
        if (tests.isEmpty()) {
            return SLA.YELLOW;
        }

        int failedAvg = 0;
        int failedMinor = 0;

        int totalAvg = 0;
        int totalMinor = 0;

        for (final TestStatusWithSeverityDto test : tests) {
            if (test.status() != QualityRunStatus.SUCCESS) {
                if (test.severity() == DataQualityTestSeverity.MAJOR) {
                    return SLA.RED;
                }

                if (test.severity() == DataQualityTestSeverity.AVERAGE) {
                    failedAvg++;
                }

                if (test.severity() == DataQualityTestSeverity.MINOR) {
                    failedMinor++;
                }
            }

            if (test.severity() == DataQualityTestSeverity.AVERAGE) {
                totalAvg++;
            }

            if (test.severity() == DataQualityTestSeverity.MINOR) {
                totalMinor++;
            }
        }

        if (totalAvg != 0 && failedAvg == totalAvg) {
            return SLA.RED;
        }

        if (failedAvg + 1 == totalAvg && failedMinor == totalMinor) {
            return SLA.RED;
        }

        if (failedAvg > 0) {
            return SLA.YELLOW;
        }

        if (failedMinor == totalMinor) {
            return SLA.YELLOW;
        }

        return SLA.GREEN;
    }
}
