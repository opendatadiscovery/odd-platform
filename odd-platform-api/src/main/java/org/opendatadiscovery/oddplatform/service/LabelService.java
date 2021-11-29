package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.Label;
import org.opendatadiscovery.oddplatform.api.contract.model.LabelFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LabelsResponse;

public interface LabelService extends CRUDService<Label, LabelsResponse, LabelFormData, LabelFormData> {
}
