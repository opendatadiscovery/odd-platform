package org.opendatadiscovery.oddplatform.repository.util;

import lombok.extern.slf4j.Slf4j;
import org.jooq.exception.DataAccessException;
import org.jooq.exception.SQLStateClass;
import org.opendatadiscovery.oddplatform.exception.DatabaseException;
import org.opendatadiscovery.oddplatform.exception.ExceptionWithErrorCode;
import org.opendatadiscovery.oddplatform.exception.UniqueConstraintException;

@Slf4j
public final class ExceptionUtils {
    private static final String OWNER_NAME_UNIQUE = "owner_name_unique";
    private static final String NAMESPACE_NAME_UNIQUE = "namespace_unique";
    private static final String DATASOURCE_NAME_UNIQUE = "data_source_name_unique";
    private static final String DATASOURCE_ODDRN_UNIQUE = "data_source_oddrn_unique";
    private static final String COLLECTOR_NAME_UNIQUE = "collector_name_unique";
    private static final String TAG_NAME_UNIQUE = "tag_name_unique";
    private static final String LABEL_NAME_UNIQUE = "label_unique";
    private static final String ROLE_NAME_UNIQUE = "role_name_unique";
    private static final String POLICY_NAME_UNIQUE = "policy_name_unique";
    private static final String INTERNAL_METADATA_NAME_UNIQUE = "ix_unique_internal_name";
    private static final String ENUM_VALUE_UNIQUE = "enum_value_unique";
    private static final String OWNERSHIP_UNIQUE = "ownership_data_entity_id_owner_id_key";
    private static final String TITLE_NAME_UNIQUE = "title_name_unique";
    private static final String TERM_NAME_NAMESPACE_UNIQUE = "term_name_namespace_unique";
    private static final String TERM_OWNERSHIP_UNIQUE = "term_id_owner_id_unique";

    private ExceptionUtils() {
    }

    public static ExceptionWithErrorCode translateDatabaseException(final DataAccessException e) {
        if (e.sqlStateClass() == SQLStateClass.C23_INTEGRITY_CONSTRAINT_VIOLATION) {
            return new UniqueConstraintException(formatMessage(e.getCause().getMessage()));
        }
        log.error("Database exception", e);
        return new DatabaseException();
    }

    private static String formatMessage(final String message) {
        if (message.contains(OWNER_NAME_UNIQUE)) {
            return "Owner with this name already exists";
        }
        if (message.contains(NAMESPACE_NAME_UNIQUE)) {
            return "Namespace with this name already exists";
        }
        if (message.contains(DATASOURCE_NAME_UNIQUE)) {
            return "Data source with this name already exists";
        }
        if (message.contains(DATASOURCE_ODDRN_UNIQUE)) {
            return "Data source with this oddrn already exists";
        }
        if (message.contains(COLLECTOR_NAME_UNIQUE)) {
            return "Collector with this name already exists";
        }
        if (message.contains(TAG_NAME_UNIQUE)) {
            return "Tag with this name already exists";
        }
        if (message.contains(LABEL_NAME_UNIQUE)) {
            return "Label with this name already exists";
        }
        if (message.contains(ROLE_NAME_UNIQUE)) {
            return "Role with this name already exists";
        }
        if (message.contains(POLICY_NAME_UNIQUE)) {
            return "Policy with this name already exists";
        }
        if (message.contains(INTERNAL_METADATA_NAME_UNIQUE)) {
            return "Internal metadata with this name already exists";
        }
        if (message.contains(ENUM_VALUE_UNIQUE)) {
            return "Enum value with this name for current field already exists";
        }
        if (message.contains(OWNERSHIP_UNIQUE)) {
            return "Ownership for this data entity and owner already exists";
        }
        if (message.contains(TITLE_NAME_UNIQUE)) {
            return "Title with this name already exists";
        }
        if (message.contains(TERM_NAME_NAMESPACE_UNIQUE)) {
            return "Term with this name already exists in this namespace";
        }
        if (message.contains(TERM_OWNERSHIP_UNIQUE)) {
            return "Ownership for this term and owner already exists";
        }
        log.error(message);
        return "Database constraint violation";
    }
}
