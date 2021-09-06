package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.api.contract.model.DataEntity;
import com.provectus.oddplatform.api.contract.model.DataEntityList;
import com.provectus.oddplatform.api.contract.model.DataQualityTestExpectation;
import com.provectus.oddplatform.api.contract.model.DataQualityTestRun;
import com.provectus.oddplatform.api.contract.model.DataQualityTestRunList;
import com.provectus.oddplatform.api.contract.model.DataSetTestReport;
import com.provectus.oddplatform.dto.DataEntityDetailsDto;
import com.provectus.oddplatform.dto.DataEntityDetailsDto.DataQualityTestDetailsDto;
import com.provectus.oddplatform.dto.DatasetTestReportDto;
import com.provectus.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Collection;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.MapUtils;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataQualityMapperImpl implements DataQualityMapper {
    private final DataEntityMapper dataEntityMapper;

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
    public DataEntity mapDataQualityTest(final DataEntityDetailsDto dto) {
        final DataQualityTestDetailsDto dqDto = dto.getDataQualityTestDetailsDto();

        return dataEntityMapper.mapPojo(dto)
                .suiteName(dqDto.getSuiteName())
                .suiteUrl(dqDto.getSuiteUrl())
                .expectation(mapDataQualityTestExpectation(dqDto))
                .latestRun(mapDataQualityTestRun(dto.getDataEntity().getId(), dqDto.getLatestTaskRun()))
                .linkedUrlList(dqDto.getLinkedUrlList())
                .datasetsList(dqDto
                        .getDatasetList()
                        .stream()
                        .map(dataEntityMapper::mapRef)
                        .collect(Collectors.toList()));
    }

    @Override
    public DataEntityList mapDataQualityTests(final Collection<DataEntityDetailsDto> dtos) {
        return new DataEntityList()
                .items(dtos.stream().map(this::mapDataQualityTest).collect(Collectors.toList()));
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

    private DataQualityTestExpectation mapDataQualityTestExpectation(final DataQualityTestDetailsDto dto) {
        final DataQualityTestExpectation expectation = new DataQualityTestExpectation().type(dto.getExpectationType());

        expectation.putAll(MapUtils.emptyIfNull(dto.getExpectationParameters()));

        return expectation;
    }

    // TODO: duplicate with ReadOnlyCRUDMapper#addUTC
    private OffsetDateTime addUTC(final LocalDateTime time) {
        if (null == time) {
            return null;
        }

        return time.atOffset(ZoneOffset.UTC);
    }
}
