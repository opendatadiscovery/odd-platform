package org.opendatadiscovery.oddplatform.mapper;

import java.util.Collection;
import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityClass;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityClassAndTypeDictionary;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGroupFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityUsageInfo;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityStatisticsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataQualityTestSeverityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.utils.Page;

public interface DataEntityMapper {
    DataEntity mapPojo(final DataEntityDimensionsDto dto);

    DataEntityList mapPojos(final List<DataEntityDimensionsDto> dataEntityDto);

    DataEntityList mapPojos(final Page<DataEntityDimensionsDto> dataEntityDto);

    DataEntityPojo mapToPojo(final DataEntityGroupFormData formData,
                             final DataEntityClassDto classDto,
                             final NamespacePojo namespacePojo);

    DataEntityPojo applyToPojo(final DataEntityGroupFormData formData,
                               final NamespacePojo namespacePojo,
                               final DataEntityPojo pojo);

    DataEntityDetails mapDtoDetails(final DataEntityDetailsDto dataEntityDetailsDto);

    DataEntity mapDataQualityTest(final DataEntityDimensionsDto dto, final String severity);

    DataEntityList mapDataQualityTests(final Collection<DataEntityDimensionsDto> dtos,
                                       final Collection<DataQualityTestSeverityPojo> severities);

    DataEntityType mapType(final DataEntityTypeDto type);

    DataEntityClass mapEntityClass(final DataEntityClassDto entityClass);

    DataEntityClassAndTypeDictionary getTypeDict();

    DataEntityRef mapRef(final DataEntityDto dto);

    DataEntityRef mapRef(final DataEntityPojo pojo);

    DataEntityUsageInfo mapUsageInfo(final DataEntityStatisticsPojo pojo,
                                     final Long filledEntitiesCount);
}
