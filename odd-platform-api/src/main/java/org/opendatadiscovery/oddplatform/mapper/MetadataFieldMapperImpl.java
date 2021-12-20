package org.opendatadiscovery.oddplatform.mapper;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataField;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldList;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldOrigin;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldType;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldValue;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataUpdateCustomFieldFormData;
import org.opendatadiscovery.oddplatform.dto.MetadataDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Component;

@Component
public class MetadataFieldMapperImpl implements MetadataFieldMapper {
    @Override
    public MetadataField mapPojo(final MetadataFieldPojo pojo) {
        return new MetadataField()
            .id(pojo.getId())
            .name(pojo.getName())
            .type(MetadataFieldType.valueOf(pojo.getType()))
            .origin(MetadataFieldOrigin.valueOf(pojo.getOrigin()));
    }

    @Override
    public MetadataFieldList mapPojos(final List<MetadataFieldPojo> pojos) {
        return new MetadataFieldList()
            .items(mapPojoList(pojos))
            .pageInfo(pageInfo(pojos.size()));
    }

    @Override
    public MetadataFieldList mapPojos(final Page<MetadataFieldPojo> pojos) {
        return new MetadataFieldList()
            .items(mapPojoList(pojos.getData()))
            .pageInfo(pageInfo(pojos));
    }

    @Override
    public MetadataFieldPojo mapForm(final MetadataFieldFormData form) {
        return new MetadataFieldPojo()
            .setName(form.getName())
            .setType(form.getType());
    }

    @Override
    public MetadataFieldPojo applyForm(final MetadataFieldPojo pojo,
                                       final MetadataUpdateCustomFieldFormData form) {
        return pojo.setName(form.getName());
    }

    @Override
    public MetadataFieldValue mapDto(final MetadataDto dto) {
        return new MetadataFieldValue()
            .field(mapField(dto.metadataField()))
            .value(dto.metadataFieldValue().getValue());
    }

    @Override
    public List<MetadataFieldValue> mapDtos(final Collection<MetadataDto> dto) {
        return dto.stream().map(this::mapDto).collect(Collectors.toList());
    }

    private MetadataField mapField(final MetadataFieldPojo pojo) {
        return new MetadataField()
            .id(pojo.getId())
            .name(pojo.getName())
            .origin(MetadataFieldOrigin.valueOf(pojo.getOrigin()))
            .type(MetadataFieldType.fromValue(pojo.getType()));
    }
}
