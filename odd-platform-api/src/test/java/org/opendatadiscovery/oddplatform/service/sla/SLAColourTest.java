package org.opendatadiscovery.oddplatform.service.sla;

import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestSeverity;
import org.opendatadiscovery.oddplatform.dto.SLA;
import org.opendatadiscovery.oddplatform.dto.TestStatusWithSeverityDto;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.QualityRunStatus;

import static org.assertj.core.api.Assertions.assertThat;

public class SLAColourTest {
    private final SLACalculator slaCalculator = new SLACalculator();

    @Test
    public void shouldBeRedIfAtLeastOneCriticalTestFailed() {
        final List<TestStatusWithSeverityDto> tests = List.of(
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.FAILED, DataQualityTestSeverity.CRITICAL)
        );

        assertThat(slaCalculator.calculateSLA(tests)).isEqualTo(SLA.RED);
    }

    @Test
    public void shouldBeRedIfAllMajorTestsFailed() {
        final List<TestStatusWithSeverityDto> tests = List.of(
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.CRITICAL),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.CRITICAL),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.FAILED, DataQualityTestSeverity.MAJOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SKIPPED, DataQualityTestSeverity.MAJOR),
            new TestStatusWithSeverityDto(QualityRunStatus.BROKEN, DataQualityTestSeverity.MAJOR)
        );

        assertThat(slaCalculator.calculateSLA(tests)).isEqualTo(SLA.RED);
    }

    @Test
    public void shouldBeRedIfAllMinorTestsFailedAndOnlyOneMajorSuccess() {
        final List<TestStatusWithSeverityDto> tests = List.of(
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.CRITICAL),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.CRITICAL),
            new TestStatusWithSeverityDto(QualityRunStatus.FAILED, DataQualityTestSeverity.MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.FAILED, DataQualityTestSeverity.MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.FAILED, DataQualityTestSeverity.MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.FAILED, DataQualityTestSeverity.MAJOR),
            new TestStatusWithSeverityDto(QualityRunStatus.FAILED, DataQualityTestSeverity.MAJOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MAJOR)
        );

        assertThat(slaCalculator.calculateSLA(tests)).isEqualTo(SLA.RED);
    }

    @Test
    public void shouldBeYellowIfAtLeastOneMajorTestFailedAndMinorsAreNotExists() {
        final List<TestStatusWithSeverityDto> tests = List.of(
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.CRITICAL),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.CRITICAL),
            new TestStatusWithSeverityDto(QualityRunStatus.FAILED, DataQualityTestSeverity.MAJOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MAJOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MAJOR)
        );

        assertThat(slaCalculator.calculateSLA(tests)).isEqualTo(SLA.YELLOW);
    }

    @Test
    public void shouldBeYellowIfAtLeastOneMajorTestFailed() {
        final List<TestStatusWithSeverityDto> tests = List.of(
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.CRITICAL),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.CRITICAL),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.FAILED, DataQualityTestSeverity.MAJOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MAJOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MAJOR)
        );

        assertThat(slaCalculator.calculateSLA(tests)).isEqualTo(SLA.YELLOW);
    }

    @Test
    public void shouldBeYellowIfAllMinorTestFailed() {
        final List<TestStatusWithSeverityDto> tests = List.of(
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.CRITICAL),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.CRITICAL),
            new TestStatusWithSeverityDto(QualityRunStatus.FAILED, DataQualityTestSeverity.MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.FAILED, DataQualityTestSeverity.MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.FAILED, DataQualityTestSeverity.MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MAJOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MAJOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MAJOR)
        );

        assertThat(slaCalculator.calculateSLA(tests)).isEqualTo(SLA.YELLOW);
    }

    @Test
    public void shouldBeYellowIfNoTestsProvided() {
        assertThat(slaCalculator.calculateSLA(Collections.emptyList())).isEqualTo(SLA.YELLOW);
    }

    @Test
    public void shouldBeGreenIfAllIsSuccess() {
        final List<TestStatusWithSeverityDto> tests = List.of(
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.CRITICAL),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.CRITICAL),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MAJOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MAJOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MAJOR)
        );

        assertThat(slaCalculator.calculateSLA(tests)).isEqualTo(SLA.GREEN);
    }

    @Test
    public void shouldBeGreenIfMostMinorTestAreSuccess() {
        final List<TestStatusWithSeverityDto> tests = List.of(
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.CRITICAL),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.CRITICAL),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.FAILED, DataQualityTestSeverity.MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MINOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MAJOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MAJOR),
            new TestStatusWithSeverityDto(QualityRunStatus.SUCCESS, DataQualityTestSeverity.MAJOR)
        );

        assertThat(slaCalculator.calculateSLA(tests)).isEqualTo(SLA.GREEN);
    }
}
