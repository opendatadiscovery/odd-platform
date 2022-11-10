package org.opendatadiscovery.oddplatform.partition.manager;

import java.time.LocalDate;

public record TablePartition(LocalDate beginDate, LocalDate endDate) {
}
