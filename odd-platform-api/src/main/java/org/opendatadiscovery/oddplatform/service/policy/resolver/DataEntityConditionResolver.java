package org.opendatadiscovery.oddplatform.service.policy.resolver;

import java.util.Map;
import org.opendatadiscovery.oddplatform.dto.policy.DataEntityPolicyResolverContext;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyConditionKeyDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.service.policy.comparer.Comparer;
import org.springframework.stereotype.Component;

import static java.util.Map.entry;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyConditionKeyDto.DATA_ENTITY_CLASS;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyConditionKeyDto.DATA_ENTITY_DATASOURCE_NAME;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyConditionKeyDto.DATA_ENTITY_DATASOURCE_ODDRN;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyConditionKeyDto.DATA_ENTITY_EXTERNAL_NAME;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyConditionKeyDto.DATA_ENTITY_INTERNAL_NAME;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyConditionKeyDto.DATA_ENTITY_NAMESPACE_NAME;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyConditionKeyDto.DATA_ENTITY_ODDRN;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyConditionKeyDto.DATA_ENTITY_OWNER;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyConditionKeyDto.DATA_ENTITY_OWNER_TITLE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyConditionKeyDto.DATA_ENTITY_TAG_NAME;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyConditionKeyDto.DATA_ENTITY_TYPE;
import static org.opendatadiscovery.oddplatform.service.policy.comparer.dataentity.DataEntityComparorFactory.dataEntity;
import static org.opendatadiscovery.oddplatform.service.policy.comparer.dataentity.DataEntityComparorFactory.dataEntityClass;
import static org.opendatadiscovery.oddplatform.service.policy.comparer.dataentity.DataEntityComparorFactory.dataEntityDataSource;
import static org.opendatadiscovery.oddplatform.service.policy.comparer.dataentity.DataEntityComparorFactory.dataEntityNamespace;
import static org.opendatadiscovery.oddplatform.service.policy.comparer.dataentity.DataEntityComparorFactory.dataEntityOwner;
import static org.opendatadiscovery.oddplatform.service.policy.comparer.dataentity.DataEntityComparorFactory.dataEntityOwnerTitle;
import static org.opendatadiscovery.oddplatform.service.policy.comparer.dataentity.DataEntityComparorFactory.dataEntityTag;
import static org.opendatadiscovery.oddplatform.service.policy.comparer.dataentity.DataEntityComparorFactory.dataEntityType;

@Component
public class DataEntityConditionResolver extends AbstractConditionResolver<DataEntityPolicyResolverContext> {
    private static final Map<PolicyConditionKeyDto, Comparer<DataEntityPolicyResolverContext>> FIELDS = Map.ofEntries(
        entry(DATA_ENTITY_ODDRN, dataEntity(DataEntityPojo::getOddrn)),
        entry(DATA_ENTITY_INTERNAL_NAME, dataEntity(DataEntityPojo::getInternalName)),
        entry(DATA_ENTITY_EXTERNAL_NAME, dataEntity(DataEntityPojo::getExternalName)),
        entry(DATA_ENTITY_TYPE, dataEntityType()),
        entry(DATA_ENTITY_CLASS, dataEntityClass()),
        entry(DATA_ENTITY_OWNER, dataEntityOwner()),
        entry(DATA_ENTITY_DATASOURCE_ODDRN, dataEntityDataSource(DataSourcePojo::getOddrn)),
        entry(DATA_ENTITY_DATASOURCE_NAME, dataEntityDataSource(DataSourcePojo::getName)),
        entry(DATA_ENTITY_NAMESPACE_NAME, dataEntityNamespace(NamespacePojo::getName)),
        entry(DATA_ENTITY_TAG_NAME, dataEntityTag()),
        entry(DATA_ENTITY_OWNER_TITLE, dataEntityOwnerTitle())
    );

    @Override
    protected Map<PolicyConditionKeyDto, Comparer<DataEntityPolicyResolverContext>> getFieldExtractorMap() {
        return FIELDS;
    }
}
