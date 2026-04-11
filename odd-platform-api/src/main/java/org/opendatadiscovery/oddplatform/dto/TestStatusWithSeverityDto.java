package org.opendatadiscovery.oddplatform.dto;

import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestSeverity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.QualityRunStatus;

public record TestStatusWithSeverityDto(QualityRunStatus status,
                                        DataQualityTestSeverity severity) {
}