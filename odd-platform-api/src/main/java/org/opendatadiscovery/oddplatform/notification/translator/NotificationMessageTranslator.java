package org.opendatadiscovery.oddplatform.notification.translator;

import org.opendatadiscovery.oddplatform.notification.dto.DecodedWALMessage;
import org.opendatadiscovery.oddplatform.notification.dto.NotificationMessage;

public interface NotificationMessageTranslator<T extends NotificationMessage> {
    T translate(final DecodedWALMessage message);
}
