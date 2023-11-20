package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import java.util.stream.Collectors;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExample;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleList;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleRef;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleRefList;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.QueryExampleDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(config = MapperConfig.class,
    uses = {
        DateTimeMapper.class,
        DataEntityMapper.class,
    })
public abstract class QueryExampleMapper {
    @Autowired
    protected DataEntityMapper dataEntityMapper;
    @Autowired
    protected DateTimeMapper dateTimeMapper;

    public abstract QueryExamplePojo mapToPojo(final QueryExampleFormData dto);

    public abstract QueryExamplePojo applyToPojo(final QueryExampleFormData dto,
                                                 @MappingTarget final QueryExamplePojo pojo);

    public abstract QueryExampleDetails mapToDetails(final QueryExamplePojo pojo,
                                                     final List<DataEntity> dataEntities);

    public abstract List<QueryExampleRef> mapToRefList(final List<QueryExamplePojo> data);

    public abstract QueryExampleRef mapToQueryExampleRef(final QueryExamplePojo pojo);

    public QueryExampleRefList mapToRefPage(final Page<QueryExamplePojo> page) {
        return new QueryExampleRefList()
            .items(mapToRefList(page.getData()))
            .pageInfo(new PageInfo().total(page.getTotal()).hasNext(page.isHasNext()));
    }

    public QueryExampleList mapPageToQueryExample(
        final Page<QueryExampleDto> dtoPage) {
        return new QueryExampleList()
            .items(mapToQueryExampleList(dtoPage.getData()))
            .pageInfo(new PageInfo().total(dtoPage.getTotal()).hasNext(dtoPage.isHasNext()));
    }

    public QueryExampleList mapListToQueryExampleList(
        final List<QueryExampleDto> queryExampleDtos) {
        return new QueryExampleList()
            .items(mapToQueryExampleList(queryExampleDtos))
            .pageInfo(new PageInfo().total((long) queryExampleDtos.size()).hasNext(false));
    }

    public List<QueryExample> mapToQueryExampleList(
        final List<QueryExampleDto> queryExampleDtos) {
        return queryExampleDtos
            .stream()
            .map(item -> mapToQueryExample(item.queryExamplePojo(),
                item.linkedEntities()))
            .collect(Collectors.toList());
    }

    public QueryExample mapToQueryExample(
        final QueryExamplePojo pojo, final List<DataEntityPojo> dataEntities) {
        return new QueryExample()
            .id(pojo.getId())
            .definition(pojo.getDefinition())
            .query(pojo.getQuery())
            .linkedEntities(mapDataEntityRefList(dataEntities));
    }

    public List<DataEntityRef> mapDataEntityRefList(final List<DataEntityPojo> dataEntities) {
        return dataEntities.stream()
            .map(item -> dataEntityMapper.mapRef(item))
            .collect(Collectors.toList());
    }

    public QueryExampleDetails mapToQueryExampleDetails(
        final QueryExamplePojo pojo, final List<DataEntityDimensionsDto> dataEntities) {
        return new QueryExampleDetails()
            .id(pojo.getId())
            .definition(pojo.getDefinition())
            .query(pojo.getQuery())
            .createdAt(dateTimeMapper.mapUTCDateTime(pojo.getCreatedAt()))
            .updatedAt(dateTimeMapper.mapUTCDateTime(pojo.getUpdatedAt()))
            .linkedEntities(dataEntityMapper.mapPojos(dataEntities));
    }
}
