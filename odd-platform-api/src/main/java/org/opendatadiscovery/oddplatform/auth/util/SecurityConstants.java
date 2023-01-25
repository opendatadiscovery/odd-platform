package org.opendatadiscovery.oddplatform.auth.util;

import java.util.List;
import lombok.experimental.UtilityClass;
import org.opendatadiscovery.oddplatform.auth.manager.AuthorizationManagerType;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.server.util.matcher.PathPatternParserServerWebExchangeMatcher;

import static org.opendatadiscovery.oddplatform.auth.manager.AuthorizationManagerType.ALERT;
import static org.opendatadiscovery.oddplatform.auth.manager.AuthorizationManagerType.DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.auth.manager.AuthorizationManagerType.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.auth.manager.AuthorizationManagerType.NO_CONTEXT;
import static org.opendatadiscovery.oddplatform.auth.manager.AuthorizationManagerType.TERM;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.COLLECTOR_CREATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.COLLECTOR_DELETE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.COLLECTOR_TOKEN_REGENERATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.COLLECTOR_UPDATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATASET_FIELD_DESCRIPTION_UPDATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATASET_FIELD_ENUMS_UPDATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATASET_FIELD_LABELS_UPDATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATASET_TEST_RUN_SET_SEVERITY;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATA_ENTITY_ADD_TERM;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATA_ENTITY_ADD_TO_GROUP;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATA_ENTITY_ALERT_CONFIG_UPDATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATA_ENTITY_ALERT_RESOLVE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATA_ENTITY_CUSTOM_METADATA_CREATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATA_ENTITY_CUSTOM_METADATA_DELETE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATA_ENTITY_CUSTOM_METADATA_UPDATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATA_ENTITY_DELETE_FROM_GROUP;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATA_ENTITY_DELETE_TERM;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATA_ENTITY_DESCRIPTION_UPDATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATA_ENTITY_GROUP_CREATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATA_ENTITY_GROUP_DELETE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATA_ENTITY_GROUP_UPDATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATA_ENTITY_INTERNAL_NAME_UPDATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATA_ENTITY_OWNERSHIP_CREATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATA_ENTITY_OWNERSHIP_DELETE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATA_ENTITY_OWNERSHIP_UPDATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATA_ENTITY_TAGS_UPDATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATA_SOURCE_CREATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATA_SOURCE_DELETE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATA_SOURCE_TOKEN_REGENERATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATA_SOURCE_UPDATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.LABEL_CREATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.LABEL_DELETE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.LABEL_UPDATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.NAMESPACE_CREATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.NAMESPACE_DELETE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.NAMESPACE_UPDATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.OWNER_ASSOCIATION_MANAGE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.OWNER_CREATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.OWNER_DELETE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.OWNER_UPDATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.POLICY_CREATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.POLICY_DELETE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.POLICY_UPDATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.ROLE_CREATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.ROLE_DELETE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.ROLE_UPDATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.TAG_CREATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.TAG_DELETE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.TAG_UPDATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.TERM_CREATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.TERM_DELETE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.TERM_OWNERSHIP_CREATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.TERM_OWNERSHIP_DELETE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.TERM_OWNERSHIP_UPDATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.TERM_TAGS_UPDATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.TERM_UPDATE;
import static org.springframework.http.HttpMethod.DELETE;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.http.HttpMethod.PUT;

@UtilityClass
public final class SecurityConstants {
    public static final String[] WHITELIST_PATHS =
        {"/actuator/**", "/favicon.ico", "/ingestion/**", "/img/**", "/api/slack/events"};

    public static final List<SecurityRule> SECURITY_RULES = List.of(
        new SecurityRule(NO_CONTEXT,
            new PathPatternParserServerWebExchangeMatcher("/api/namespaces", POST), NAMESPACE_CREATE),
        new SecurityRule(NO_CONTEXT, new PathPatternParserServerWebExchangeMatcher("/api/namespaces", POST),
            NAMESPACE_CREATE),
        new SecurityRule(NO_CONTEXT,
            new PathPatternParserServerWebExchangeMatcher("/api/namespaces/{namespace_id}", PUT),
            NAMESPACE_UPDATE),
        new SecurityRule(NO_CONTEXT,
            new PathPatternParserServerWebExchangeMatcher("/api/namespaces/{namespace_id}", DELETE),
            NAMESPACE_DELETE),
        new SecurityRule(NO_CONTEXT, new PathPatternParserServerWebExchangeMatcher("/api/dataentitygroups", POST),
            DATA_ENTITY_GROUP_CREATE),
        new SecurityRule(NO_CONTEXT, new PathPatternParserServerWebExchangeMatcher("/api/terms", POST), TERM_CREATE),
        new SecurityRule(NO_CONTEXT, new PathPatternParserServerWebExchangeMatcher("/api/datasources", POST),
            DATA_SOURCE_CREATE),
        new SecurityRule(NO_CONTEXT,
            new PathPatternParserServerWebExchangeMatcher("/api/datasources/{data_source_id}", PUT),
            DATA_SOURCE_UPDATE),
        new SecurityRule(NO_CONTEXT,
            new PathPatternParserServerWebExchangeMatcher("/api/datasources/{data_source_id}", DELETE),
            DATA_SOURCE_DELETE),
        new SecurityRule(NO_CONTEXT,
            new PathPatternParserServerWebExchangeMatcher("/api/datasources/{data_source_id}/token", PUT),
            DATA_SOURCE_TOKEN_REGENERATE),
        new SecurityRule(NO_CONTEXT, new PathPatternParserServerWebExchangeMatcher("/api/collectors", POST),
            COLLECTOR_CREATE),
        new SecurityRule(NO_CONTEXT,
            new PathPatternParserServerWebExchangeMatcher("/api/collectors/{collector_id}", PUT),
            COLLECTOR_UPDATE),
        new SecurityRule(NO_CONTEXT,
            new PathPatternParserServerWebExchangeMatcher("/api/collectors/{collector_id}", DELETE),
            COLLECTOR_DELETE),
        new SecurityRule(NO_CONTEXT,
            new PathPatternParserServerWebExchangeMatcher("/api/collectors/{collector_id}/token", PUT),
            COLLECTOR_TOKEN_REGENERATE),
        new SecurityRule(NO_CONTEXT, new PathPatternParserServerWebExchangeMatcher("/api/tags", POST), TAG_CREATE),
        new SecurityRule(NO_CONTEXT, new PathPatternParserServerWebExchangeMatcher("/api/tags/{tag_id}", PUT),
            TAG_UPDATE),
        new SecurityRule(NO_CONTEXT, new PathPatternParserServerWebExchangeMatcher("/api/tags/{tag_id}", DELETE),
            TAG_DELETE),
        new SecurityRule(NO_CONTEXT, new PathPatternParserServerWebExchangeMatcher("/api/labels", POST), LABEL_CREATE),
        new SecurityRule(NO_CONTEXT, new PathPatternParserServerWebExchangeMatcher("/api/labels/{label_id}", PUT),
            LABEL_UPDATE),
        new SecurityRule(NO_CONTEXT, new PathPatternParserServerWebExchangeMatcher("/api/labels/{label_id}", DELETE),
            LABEL_DELETE),
        new SecurityRule(NO_CONTEXT, new PathPatternParserServerWebExchangeMatcher("/api/owners", POST), OWNER_CREATE),
        new SecurityRule(NO_CONTEXT, new PathPatternParserServerWebExchangeMatcher("/api/owners/{owner_id}", PUT),
            OWNER_UPDATE),
        new SecurityRule(NO_CONTEXT, new PathPatternParserServerWebExchangeMatcher("/api/owners/{owner_id}", DELETE),
            OWNER_DELETE),
        new SecurityRule(
            NO_CONTEXT, new PathPatternParserServerWebExchangeMatcher("/api/owner_association_request", HttpMethod.GET),
            OWNER_ASSOCIATION_MANAGE),
        new SecurityRule(
            NO_CONTEXT, new PathPatternParserServerWebExchangeMatcher(
            "/api/owner_association_request/{owner_association_request_id}", PUT),
            OWNER_ASSOCIATION_MANAGE),
        new SecurityRule(NO_CONTEXT, new PathPatternParserServerWebExchangeMatcher("/api/policies", POST),
            POLICY_CREATE),
        new SecurityRule(NO_CONTEXT, new PathPatternParserServerWebExchangeMatcher("/api/policies/{policy_id}", PUT),
            POLICY_UPDATE),
        new SecurityRule(NO_CONTEXT, new PathPatternParserServerWebExchangeMatcher("/api/policies/{policy_id}", DELETE),
            POLICY_DELETE),
        new SecurityRule(NO_CONTEXT, new PathPatternParserServerWebExchangeMatcher("/api/roles", POST), ROLE_CREATE),
        new SecurityRule(NO_CONTEXT, new PathPatternParserServerWebExchangeMatcher("/api/roles/{role_id}", PUT),
            ROLE_UPDATE),
        new SecurityRule(NO_CONTEXT, new PathPatternParserServerWebExchangeMatcher("/api/roles/{role_id}", DELETE),
            ROLE_DELETE),
        new SecurityRule(TERM, new PathPatternParserServerWebExchangeMatcher("/api/terms/{term_id}", PUT), TERM_UPDATE),
        new SecurityRule(TERM, new PathPatternParserServerWebExchangeMatcher("/api/terms/{term_id}", DELETE),
            TERM_DELETE),
        new SecurityRule(TERM, new PathPatternParserServerWebExchangeMatcher("/api/terms/{term_id}/ownership", POST),
            TERM_OWNERSHIP_CREATE),
        new SecurityRule(TERM,
            new PathPatternParserServerWebExchangeMatcher("/api/terms/{term_id}/ownership/{ownership_id}", PUT),
            TERM_OWNERSHIP_UPDATE),
        new SecurityRule(TERM,
            new PathPatternParserServerWebExchangeMatcher("/api/terms/{term_id}/ownership/{ownership_id}", DELETE),
            TERM_OWNERSHIP_DELETE),
        new SecurityRule(TERM, new PathPatternParserServerWebExchangeMatcher("/api/terms/{term_id}/tags", PUT),
            TERM_TAGS_UPDATE),
        new SecurityRule(
            DATA_ENTITY,
            new PathPatternParserServerWebExchangeMatcher("/api/dataentities/{data_entity_id}/description", PUT),
            DATA_ENTITY_DESCRIPTION_UPDATE),
        new SecurityRule(DATA_ENTITY,
            new PathPatternParserServerWebExchangeMatcher("/api/dataentities/{data_entity_id}/name", PUT),
            DATA_ENTITY_INTERNAL_NAME_UPDATE),
        new SecurityRule(DATA_ENTITY,
            new PathPatternParserServerWebExchangeMatcher("/api/dataentities/{data_entity_id}/metadata", POST),
            DATA_ENTITY_CUSTOM_METADATA_CREATE),
        new SecurityRule(DATA_ENTITY,
            new PathPatternParserServerWebExchangeMatcher(
                "/api/dataentities/{data_entity_id}/metadata/{metadata_field_id}", PUT),
            DATA_ENTITY_CUSTOM_METADATA_UPDATE),
        new SecurityRule(
            DATA_ENTITY, new PathPatternParserServerWebExchangeMatcher(
            "/api/dataentities/{data_entity_id}/metadata/{metadata_field_id}", DELETE),
            DATA_ENTITY_CUSTOM_METADATA_DELETE),
        new SecurityRule(DATA_ENTITY,
            new PathPatternParserServerWebExchangeMatcher("/api/dataentities/{data_entity_id}/tags", PUT),
            DATA_ENTITY_TAGS_UPDATE),
        new SecurityRule(DATA_ENTITY,
            new PathPatternParserServerWebExchangeMatcher("/api/dataentities/{data_entity_id}/ownership", POST),
            DATA_ENTITY_OWNERSHIP_CREATE),
        new SecurityRule(
            DATA_ENTITY,
            new PathPatternParserServerWebExchangeMatcher("/api/dataentities/{data_entity_id}/ownership/{ownership_id}",
                PUT),
            DATA_ENTITY_OWNERSHIP_UPDATE),
        new SecurityRule(
            DATA_ENTITY,
            new PathPatternParserServerWebExchangeMatcher("/api/dataentities/{data_entity_id}/ownership/{ownership_id}",
                DELETE),
            DATA_ENTITY_OWNERSHIP_DELETE),
        new SecurityRule(
            DATA_ENTITY,
            new PathPatternParserServerWebExchangeMatcher("/api/dataentities/{data_entity_id}/data_entity_group", POST),
            DATA_ENTITY_ADD_TO_GROUP),
        new SecurityRule(
            DATA_ENTITY,
            new PathPatternParserServerWebExchangeMatcher(
                "/api/dataentities/{data_entity_id}/data_entity_group/{data_entity_group_id}", DELETE),
            DATA_ENTITY_DELETE_FROM_GROUP),
        new SecurityRule(DATA_ENTITY,
            new PathPatternParserServerWebExchangeMatcher("/api/dataentities/{data_entity_id}/term", POST),
            DATA_ENTITY_ADD_TERM),
        new SecurityRule(DATA_ENTITY,
            new PathPatternParserServerWebExchangeMatcher("/api/dataentities/{data_entity_id}/term/{term_id}", DELETE),
            DATA_ENTITY_DELETE_TERM),
        new SecurityRule(
            DATA_ENTITY, new PathPatternParserServerWebExchangeMatcher(
            "/api/datasets/{data_entity_id}/dataqatests/{dataqa_test_id}/severity", PUT),
            DATASET_TEST_RUN_SET_SEVERITY),
        new SecurityRule(DATASET_FIELD,
            new PathPatternParserServerWebExchangeMatcher("/api/datasetfields/{dataset_field_id}/description", PUT),
            DATASET_FIELD_DESCRIPTION_UPDATE),
        new SecurityRule(DATASET_FIELD,
            new PathPatternParserServerWebExchangeMatcher("/api/datasetfields/{dataset_field_id}/labels", PUT),
            DATASET_FIELD_LABELS_UPDATE),
        new SecurityRule(
            DATASET_FIELD,
            new PathPatternParserServerWebExchangeMatcher("/api/datasetfields/{dataset_field_id}/enum_values", POST),
            DATASET_FIELD_ENUMS_UPDATE),
        new SecurityRule(ALERT, new PathPatternParserServerWebExchangeMatcher("/api/alerts/{alert_id}/status", PUT),
            DATA_ENTITY_ALERT_RESOLVE),
        new SecurityRule(
            DATA_ENTITY,
            new PathPatternParserServerWebExchangeMatcher("/api/dataentities/{data_entity_id}/alert_config", PUT),
            DATA_ENTITY_ALERT_CONFIG_UPDATE),
        new SecurityRule(
            AuthorizationManagerType.DEG,
            new PathPatternParserServerWebExchangeMatcher("/api/dataentitygroups/{data_entity_group_id}", PUT),
            DATA_ENTITY_GROUP_UPDATE),
        new SecurityRule(AuthorizationManagerType.DEG,
            new PathPatternParserServerWebExchangeMatcher("/api/dataentitygroups/{data_entity_group_id}", DELETE),
            DATA_ENTITY_GROUP_DELETE)
    );
}
