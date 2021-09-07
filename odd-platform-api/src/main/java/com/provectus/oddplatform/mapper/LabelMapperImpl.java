package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.api.contract.model.Label;
import com.provectus.oddplatform.api.contract.model.LabelFormData;
import com.provectus.oddplatform.api.contract.model.LabelsResponse;
import com.provectus.oddplatform.model.tables.pojos.LabelPojo;
import com.provectus.oddplatform.utils.Page;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class LabelMapperImpl implements LabelMapper {
    @Override
    public LabelPojo mapForm(final LabelFormData form) {
        return new LabelPojo().setName(form.getName());
    }

    @Override
    public LabelPojo applyForm(final LabelPojo pojo, final LabelFormData form) {
        return pojo.setName(form.getName());
    }

    @Override
    public Label mapPojo(final LabelPojo pojo) {
        return new Label()
            .id(pojo.getId())
            .name(pojo.getName());
    }

    @Override
    public LabelsResponse mapPojos(final List<LabelPojo> pojos) {
        return new LabelsResponse()
            .items(pojos.stream().map(this::mapPojo).collect(Collectors.toList()))
            .pageInfo(pageInfo(pojos.size()));
    }

    @Override
    public LabelsResponse mapPojos(final Page<LabelPojo> pojos) {
        return new LabelsResponse()
            .items(mapPojoList(pojos.getData()))
            .pageInfo(pageInfo(pojos));
    }
}
