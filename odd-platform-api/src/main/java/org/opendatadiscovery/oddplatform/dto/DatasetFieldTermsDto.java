package org.opendatadiscovery.oddplatform.dto;

import java.util.List;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.jooq.JSONB;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;

@EqualsAndHashCode
@ToString
@Data
@Builder
public class DatasetFieldTermsDto {
    private Long id;
    private String name;
    private String internalName;
    private String oddrn;
    private JSONB type;
    private Boolean isKey;
    private Boolean isValue;
    private String externalDescription;
    private String internalDescription;
    private Boolean isPrimaryKey;
    private Boolean isSortKey;
    private String defaultValue;
    private List<OwnershipDto> ownership;
    private DataSourcePojo dataSource;
    private String dataEntityName;
    private Long dataEntityId;
    private NamespacePojo namespace;
}
