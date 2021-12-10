package org.opendatadiscovery.oddplatform.dto;

// TODO: replace with database impl
public enum DataEntitySubtype {
    TABLE,
    FILE,
    FEATURE_GROUP,
    KAFKA_TOPIC,

    JOB,
    JOB_RUN,
    EXPERIMENT,
    ML_MODEL_TRAINING,
    ML_MODEL_INSTANCE,

    DASHBOARD,
    ML_MODEL_ARTIFACT,

    VIEW,
    MICROSERVICE,

    API_CALL,

    UNKNOWN
}
