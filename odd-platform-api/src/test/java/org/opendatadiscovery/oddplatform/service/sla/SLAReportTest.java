package org.opendatadiscovery.oddplatform.service.sla;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetSLAReport;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetSLASeverityWeight;
import org.opendatadiscovery.oddplatform.api.contract.model.SLAColour;
import org.opendatadiscovery.oddplatform.dto.TestStatusWithSeverityDto;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.QualityRunStatus;

import static org.assertj.core.api.Assertions.assertThat;
import static org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestSeverity.CRITICAL;
import static org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestSeverity.MAJOR;
import static org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestSeverity.MINOR;

public class SLAReportTest {
    private final SLACalculator slaCalculator = new SLACalculator();

    @Test
    public void emptyTests() {
        final DataSetSLAReport slaReport = slaCalculator.getSLAReport(1L, List.of());
        assertThat(slaReport.getTotal()).isEqualTo(0);
        assertThat(slaReport.getSuccess()).isEqualTo(0);
        assertThat(slaReport.getSlaColour()).isEqualTo(SLAColour.YELLOW);
        assertThat(slaReport.getSeverityWeights())
            .hasSize(3)
            .containsExactlyInAnyOrder(
                new DataSetSLASeverityWeight().severity(MINOR).count(0L),
                new DataSetSLASeverityWeight().severity(MAJOR).count(0L),
                new DataSetSLASeverityWeight().severity(CRITICAL).count(0L));
    }

    @Test
    public void allTestsArePresented() {
        final List<TestStatusWithSeverityDto> tests = List.of(
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.FAILED, MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, MAJOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, MAJOR),
            new TestStatusWithSeverityDto(QualityRunStatus.FAILED, MAJOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, CRITICAL),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, CRITICAL),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, CRITICAL)
        );

        final DataSetSLAReport slaReport = slaCalculator.getSLAReport(1L, tests);

        assertThat(slaReport.getTotal()).isEqualTo(39);
        assertThat(slaReport.getSuccess()).isEqualTo(35);
        assertThat(slaReport.getSlaColour()).isEqualTo(SLAColour.YELLOW);
        assertThat(slaReport.getSeverityWeights())
            .hasSize(3)
            .containsExactlyInAnyOrder(
                new DataSetSLASeverityWeight().severity(MINOR).count(3L),
                new DataSetSLASeverityWeight().severity(MAJOR).count(9L),
                new DataSetSLASeverityWeight().severity(CRITICAL).count(27L));
    }

    @Test
    public void minorAndMajorTests() {
        final List<TestStatusWithSeverityDto> tests = List.of(
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.FAILED, MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, MAJOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, MAJOR),
            new TestStatusWithSeverityDto(QualityRunStatus.FAILED, MAJOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, MAJOR)
        );

        final DataSetSLAReport slaReport = slaCalculator.getSLAReport(1L, tests);

        assertThat(slaReport.getTotal()).isEqualTo(15);
        assertThat(slaReport.getSuccess()).isEqualTo(11);
        assertThat(slaReport.getSlaColour()).isEqualTo(SLAColour.YELLOW);
        assertThat(slaReport.getSeverityWeights())
            .hasSize(3)
            .containsExactlyInAnyOrder(
                new DataSetSLASeverityWeight().severity(MINOR).count(3L),
                new DataSetSLASeverityWeight().severity(MAJOR).count(12L),
                new DataSetSLASeverityWeight().severity(CRITICAL).count(0L));
    }

    @Test
    public void minorAndCriticalTests() {
        final List<TestStatusWithSeverityDto> tests = List.of(
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.FAILED, MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, CRITICAL),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, CRITICAL),
            new TestStatusWithSeverityDto(QualityRunStatus.FAILED, CRITICAL),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, CRITICAL)
        );

        final DataSetSLAReport slaReport = slaCalculator.getSLAReport(1L, tests);

        assertThat(slaReport.getTotal()).isEqualTo(15);
        assertThat(slaReport.getSuccess()).isEqualTo(11);
        assertThat(slaReport.getSlaColour()).isEqualTo(SLAColour.RED);
        assertThat(slaReport.getSeverityWeights())
            .hasSize(3)
            .containsExactlyInAnyOrder(
                new DataSetSLASeverityWeight().severity(MINOR).count(3L),
                new DataSetSLASeverityWeight().severity(MAJOR).count(0L),
                new DataSetSLASeverityWeight().severity(CRITICAL).count(12L));
    }

    @Test
    public void majorAndCriticalTests() {
        final List<TestStatusWithSeverityDto> tests = List.of(
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, MAJOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, MAJOR),
            new TestStatusWithSeverityDto(QualityRunStatus.FAILED, MAJOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, CRITICAL),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, CRITICAL),
            new TestStatusWithSeverityDto(QualityRunStatus.FAILED, CRITICAL),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, CRITICAL)
        );

        final DataSetSLAReport slaReport = slaCalculator.getSLAReport(1L, tests);

        assertThat(slaReport.getTotal()).isEqualTo(15);
        assertThat(slaReport.getSuccess()).isEqualTo(11);
        assertThat(slaReport.getSlaColour()).isEqualTo(SLAColour.RED);
        assertThat(slaReport.getSeverityWeights())
            .hasSize(3)
            .containsExactlyInAnyOrder(
                new DataSetSLASeverityWeight().severity(MINOR).count(0L),
                new DataSetSLASeverityWeight().severity(MAJOR).count(3L),
                new DataSetSLASeverityWeight().severity(CRITICAL).count(12L));
    }

    @Test
    public void minorTests() {
        final List<TestStatusWithSeverityDto> tests = List.of(
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.FAILED, MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.ABORTED, MINOR)
        );

        final DataSetSLAReport slaReport = slaCalculator.getSLAReport(1L, tests);

        assertThat(slaReport.getTotal()).isEqualTo(3);
        assertThat(slaReport.getSuccess()).isEqualTo(2);
        assertThat(slaReport.getSlaColour()).isEqualTo(SLAColour.GREEN);
        assertThat(slaReport.getSeverityWeights())
            .hasSize(3)
            .containsExactlyInAnyOrder(
                new DataSetSLASeverityWeight().severity(MINOR).count(3L),
                new DataSetSLASeverityWeight().severity(MAJOR).count(0L),
                new DataSetSLASeverityWeight().severity(CRITICAL).count(0L));
    }

    @Test
    public void majorTests() {
        final List<TestStatusWithSeverityDto> tests = List.of(
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, MAJOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, MAJOR),
            new TestStatusWithSeverityDto(QualityRunStatus.FAILED, MAJOR),
            new TestStatusWithSeverityDto(QualityRunStatus.ABORTED, MAJOR)
        );

        final DataSetSLAReport slaReport = slaCalculator.getSLAReport(1L, tests);

        assertThat(slaReport.getTotal()).isEqualTo(3);
        assertThat(slaReport.getSuccess()).isEqualTo(2);
        assertThat(slaReport.getSlaColour()).isEqualTo(SLAColour.YELLOW);
        assertThat(slaReport.getSeverityWeights())
            .hasSize(3)
            .containsExactlyInAnyOrder(
                new DataSetSLASeverityWeight().severity(MINOR).count(0L),
                new DataSetSLASeverityWeight().severity(MAJOR).count(3L),
                new DataSetSLASeverityWeight().severity(CRITICAL).count(0L));
    }

    @Test
    public void critialTests() {
        final List<TestStatusWithSeverityDto> tests = List.of(
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, CRITICAL),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, CRITICAL),
            new TestStatusWithSeverityDto(QualityRunStatus.FAILED, CRITICAL),
            new TestStatusWithSeverityDto(QualityRunStatus.ABORTED, CRITICAL)
        );

        final DataSetSLAReport slaReport = slaCalculator.getSLAReport(1L, tests);

        assertThat(slaReport.getTotal()).isEqualTo(3);
        assertThat(slaReport.getSuccess()).isEqualTo(2);
        assertThat(slaReport.getSlaColour()).isEqualTo(SLAColour.RED);
        assertThat(slaReport.getSeverityWeights())
            .hasSize(3)
            .containsExactlyInAnyOrder(
                new DataSetSLASeverityWeight().severity(MINOR).count(0L),
                new DataSetSLASeverityWeight().severity(MAJOR).count(0L),
                new DataSetSLASeverityWeight().severity(CRITICAL).count(3L));
    }
}
