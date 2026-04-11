package org.opendatadiscovery.oddplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatasetTestReportDto {
    private long total;
    private long successTotal;
    private long failedTotal;
    private long skippedTotal;
    private long brokenTotal;
    private long abortedTotal;
    private long unknownTotal;
}
