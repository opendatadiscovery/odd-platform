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

    interface StatusUpdated {
        String DATA_ENTITY_POJO = "pojo";
    }

    interface TermAssignment {
        String DATA_ENTITY_ID = "dataEntityId";
    }

    interface FieldTermAssignment {
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

    interface AlertHaltConfigUpdated {
        String DATA_ENTITY_ID = "dataEntityId";
    }

    interface AlertStatusUpdated {
        String ALERT_ID = "alertId";
    }
}
