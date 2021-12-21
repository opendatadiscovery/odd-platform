package org.opendatadiscovery.oddplatform.dto;

import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldValuePojo;

public record MetadataDto(MetadataFieldPojo metadataField, MetadataFieldValuePojo metadataFieldValue) { }