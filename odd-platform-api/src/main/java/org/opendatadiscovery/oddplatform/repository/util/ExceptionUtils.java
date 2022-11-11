package org.opendatadiscovery.oddplatform.repository.util;

import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;
import org.jooq.exception.DataAccessException;
import org.jooq.exception.SQLStateClass;
import org.opendatadiscovery.oddplatform.exception.DatabaseException;
import org.opendatadiscovery.oddplatform.exception.ExceptionWithErrorCode;
import org.opendatadiscovery.oddplatform.exception.UniqueConstraintException;

import static org.opendatadiscovery.oddplatform.model.Indexes.COLLECTOR_NAME_UNIQUE;
import static org.opendatadiscovery.oddplatform.model.Indexes.DATA_SOURCE_NAME_UNIQUE;
import static org.opendatadiscovery.oddplatform.model.Indexes.DATA_SOURCE_ODDRN_UNIQUE;
import static org.opendatadiscovery.oddplatform.model.Indexes.ENUM_VALUE_UNIQUE;
import static org.opendatadiscovery.oddplatform.model.Indexes.IX_UNIQUE_INTERNAL_NAME;
import static org.opendatadiscovery.oddplatform.model.Indexes.LABEL_UNIQUE;
import static org.opendatadiscovery.oddplatform.model.Indexes.NAMESPACE_UNIQUE;
import static org.opendatadiscovery.oddplatform.model.Indexes.OWNER_NAME_UNIQUE;
import static org.opendatadiscovery.oddplatform.model.Indexes.POLICY_NAME_UNIQUE;
import static org.opendatadiscovery.oddplatform.model.Indexes.ROLE_NAME_UNIQUE;
import static org.opendatadiscovery.oddplatform.model.Indexes.TAG_NAME_UNIQUE;
import static org.opendatadiscovery.oddplatform.model.Indexes.TERM_ID_OWNER_ID_UNIQUE;
import static org.opendatadiscovery.oddplatform.model.Indexes.TERM_NAME_NAMESPACE_UNIQUE;
import static org.opendatadiscovery.oddplatform.model.Indexes.TITLE_NAME_UNIQUE;
import static org.opendatadiscovery.oddplatform.model.Keys.OWNERSHIP_DATA_ENTITY_ID_OWNER_ID_KEY;

@Slf4j
@UtilityClass
public final class ExceptionUtils {

    public static ExceptionWithErrorCode translateDatabaseException(final DataAccessException e) {
        if (e.sqlStateClass() == SQLStateClass.C23_INTEGRITY_CONSTRAINT_VIOLATION) {
            return new UniqueConstraintException(formatMessage(e.getCause().getMessage()));
        }
        log.error("Database exception", e);
        return new DatabaseException();
    }

    private static String formatMessage(final String message) {
        if (message.contains(OWNER_NAME_UNIQUE.getName())) {
            return "Owner with this name already exists";
        }
        if (message.contains(NAMESPACE_UNIQUE.getName())) {
            return "Namespace with this name already exists";
        }
        if (message.contains(DATA_SOURCE_NAME_UNIQUE.getName())) {
            return "Data source with this name already exists";
        }
        if (message.contains(DATA_SOURCE_ODDRN_UNIQUE.getName())) {
            return "Data source with this oddrn already exists";
        }
        if (message.contains(COLLECTOR_NAME_UNIQUE.getName())) {
            return "Collector with this name already exists";
        }
        if (message.contains(TAG_NAME_UNIQUE.getName())) {
            return "Tag with this name already exists";
        }
        if (message.contains(LABEL_UNIQUE.getName())) {
            return "Label with this name already exists";
        }
        if (message.contains(ROLE_NAME_UNIQUE.getName())) {
            return "Role with this name already exists";
        }
        if (message.contains(POLICY_NAME_UNIQUE.getName())) {
            return "Policy with this name already exists";
        }
        if (message.contains(IX_UNIQUE_INTERNAL_NAME.getName())) {
            return "Internal metadata with this name already exists";
        }
        if (message.contains(ENUM_VALUE_UNIQUE.getName())) {
            return "Enum value with this name for current field already exists";
        }
        if (message.contains(OWNERSHIP_DATA_ENTITY_ID_OWNER_ID_KEY.getName())) {
            return "Ownership for this data entity and owner already exists";
        }
        if (message.contains(TITLE_NAME_UNIQUE.getName())) {
            return "Title with this name already exists";
        }
        if (message.contains(TERM_NAME_NAMESPACE_UNIQUE.getName())) {
            return "Term with this name already exists in this namespace";
        }
        if (message.contains(TERM_ID_OWNER_ID_UNIQUE.getName())) {
            return "Ownership for this term and owner already exists";
        }
        log.error(message);
        return "Database constraint violation";
    }
}
