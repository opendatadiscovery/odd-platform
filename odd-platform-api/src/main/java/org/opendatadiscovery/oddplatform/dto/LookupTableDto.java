package org.opendatadiscovery.oddplatform.dto;

import java.util.List;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesDefinitionsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;

public record LookupTableDto(LookupTablesPojo tablesPojo,
                             NamespacePojo namespacePojo,
                             List<LookupTablesDefinitionsPojo> definitionsPojos) {
}
