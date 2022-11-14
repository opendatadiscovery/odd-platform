package org.opendatadiscovery.oddplatform.datacollaboration.exception;

public class DataCollaborationMessageEventProcessingException extends RuntimeException {
    public DataCollaborationMessageEventProcessingException(final Throwable cause) {
        super(cause);
    }

    public DataCollaborationMessageEventProcessingException(final String message, final Throwable cause) {
        super(message, cause);
    }

    public DataCollaborationMessageEventProcessingException(final String message) {
        super(message);
    }
}
