package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.Label;
import com.provectus.oddplatform.api.contract.model.LabelFormData;
import com.provectus.oddplatform.api.contract.model.LabelsResponse;

public interface LabelService extends CRUDService<Label, LabelsResponse, LabelFormData, LabelFormData> {
}
