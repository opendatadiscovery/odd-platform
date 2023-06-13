package org.opendatadiscovery.oddplatform.utils;

public interface ActivityParameterNames {
    interface OwnershipCreate {
        String DATA_ENTITY_ID = "dataEntityId";
    }

    interface OwnershipUpdate {
        String OWNERSHIP_ID = "ownershipId";
    }

    interface OwnershipDelete {
        String OWNERSHIP_ID = "ownershipId";
    }

    interface DescriptionUpdated {
        String DATA_ENTITY_ID = "dataEntityId";
    }

    interface InternalNameUpdated {
        String DATA_ENTITY_ID = "dataEntityId";
    }

    interface TermAssigned {
        String DATA_ENTITY_ID = "dataEntityId";
    }

    interface TermAssignmentDeleted {
        String DATA_ENTITY_ID = "dataEntityId";
    }

    interface FieldTermAssigned {
        String DATASET_FIELD_ID = "datasetFieldId";
    }

    interface FieldTermAssignmentDeleted {
        String DATASET_FIELD_ID = "datasetFieldId";
    }

    interface DatasetFieldInformationUpdated {
        String DATASET_FIELD_ID = "datasetFieldId";
    }

    interface DatasetFieldValuesUpdated {
        String DATASET_FIELD_ID = "datasetFieldId";
    }

    interface TagsAssociationUpdated {
        String DATA_ENTITY_ID = "dataEntityId";
    }

    interface CustomGroupUpdated {
        String DATA_ENTITY_ID = "dataEntityId";
    }

    interface CustomGroupDeleted {
        String DATA_ENTITY_ID = "dataEntityId";
    }

    interface AlertHaltConfigUpdated {
        String DATA_ENTITY_ID = "dataEntityId";
    }

    interface AlertStatusUpdated {
        String ALERT_ID = "alertId";
    }
}
