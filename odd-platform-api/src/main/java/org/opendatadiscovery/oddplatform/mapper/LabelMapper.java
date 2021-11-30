package org.opendatadiscovery.oddplatform.mapper;

import org.opendatadiscovery.oddplatform.api.contract.model.Label;
import org.opendatadiscovery.oddplatform.api.contract.model.LabelFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LabelsResponse;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;

public interface LabelMapper extends CRUDMapper<Label, LabelsResponse, LabelFormData, LabelFormData, LabelPojo> {
}
