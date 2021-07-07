package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.api.contract.model.Label;
import com.provectus.oddplatform.api.contract.model.LabelFormData;
import com.provectus.oddplatform.api.contract.model.LabelsResponse;
import com.provectus.oddplatform.model.tables.pojos.LabelPojo;

public interface LabelMapper extends CRUDMapper<Label, LabelsResponse, LabelFormData, LabelFormData, LabelPojo> {
}
