package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.api.contract.model.DataQualityTestRun;
import com.provectus.oddplatform.api.contract.model.DataQualityTestRunList;
import com.provectus.oddplatform.api.contract.model.DataSetTestReport;
import com.provectus.oddplatform.dto.DatasetTestReportDto;
import com.provectus.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Collection;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class DataQualityMapperImpl implements DataQualityMapper {
    @Override
    public DataQualityTestRun mapDataQualityTestRun(final long dataQualityTestId, final DataEntityTaskRunPojo run) {
        return new DataQualityTestRun()
            .id(run.getId())
            .dataQualityTestId(dataQualityTestId)
            .name(run.getName())
            .oddrn(run.getOddrn())
            .startTime(addUTC(run.getStartTime()))
            .endTime(addUTC(run.getEndTime()))
            .status(DataQualityTestRun.StatusEnum.fromValue(run.getStatus()))
            .statusReason(run.getStatusReason());
    }

    @Override
    public DataQualityTestRunList mapDataQualityTestRuns(final long dataQualityTestId,
                                                         final Collection<DataEntityTaskRunPojo> runs) {
        return new DataQualityTestRunList().items(
            runs.stream()
                .map(r -> mapDataQualityTestRun(dataQualityTestId, r))
                .collect(Collectors.toList())
        );
    }

    @Override
    public DataSetTestReport mapDatasetTestReport(final DatasetTestReportDto report) {
        return new DataSetTestReport()
            .total(report.getTotal())
            // stub
            .score(100)
            .successTotal(report.getSuccessTotal())
            .failedTotal(report.getFailedTotal())
            .brokenTotal(report.getBrokenTotal())
            .skippedTotal(report.getSkippedTotal())
            .abortedTotal(report.getAbortedTotal())
            .unknownTotal(report.getUnknownTotal());
    }

    // TODO: duplicate with ReadOnlyCRUDMapper#addUTC
    private OffsetDateTime addUTC(final LocalDateTime time) {
        if (null == time) {
            return null;
        }

        return time.atOffset(ZoneOffset.UTC);
    }
}
