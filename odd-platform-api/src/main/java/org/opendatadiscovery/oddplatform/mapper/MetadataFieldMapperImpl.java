package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataField;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldList;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldOrigin;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldType;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataObject;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import org.springframework.stereotype.Component;

@Component
public class MetadataFieldMapperImpl implements MetadataFieldMapper {

    @Override
    public MetadataField mapPojo(final MetadataFieldPojo pojo) {
        final MetadataField metadataField = new MetadataField()
            .id(pojo.getId())
            .name(pojo.getName())
            .type(MetadataFieldType.valueOf(pojo.getType()));
        if (pojo.getOrigin() != null) {
            metadataField.setOrigin(MetadataFieldOrigin.valueOf(pojo.getOrigin()));
        }
        return metadataField;
    }

    @Override
    public MetadataFieldList mapPojos(final List<MetadataFieldPojo> pojos) {
        return new MetadataFieldList()
            .items(pojos.stream().map(this::mapPojo).toList())
            .pageInfo(new PageInfo().total((long) pojos.size()).hasNext(false));
    }

    @Override
    public MetadataFieldPojo mapObject(final MetadataObject object) {
        final MetadataFieldPojo fieldPojo = new MetadataFieldPojo()
            .setName(object.getName())
            .setType(object.getType().getValue());
        if (object.getOrigin() != null) {
            fieldPojo.setOrigin(object.getOrigin().getValue());
        }
        return fieldPojo;
    }
}
