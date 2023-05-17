package org.opendatadiscovery.oddplatform.dto.ingestion;

import lombok.Builder;
import lombok.Getter;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetFieldType;

@Builder
@Getter
public class HashableDatasetField {
    private String oddrn;
    private String name;
    private String parentFieldOddrn;
    private DataSetFieldType type;
    private boolean isKey;
    private boolean isValue;
    private boolean isPrimaryKey;
}
