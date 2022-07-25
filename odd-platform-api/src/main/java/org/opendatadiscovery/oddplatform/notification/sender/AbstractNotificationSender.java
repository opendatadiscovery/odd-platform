package org.opendatadiscovery.oddplatform.notification.sender;

import java.io.IOException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.notification.dto.NotificationMessage;
import org.opendatadiscovery.oddplatform.notification.exception.NotificationSenderException;
import org.springframework.http.HttpStatus;

@RequiredArgsConstructor
public abstract class AbstractNotificationSender<T extends NotificationMessage> implements NotificationSender<T> {
    private final HttpClient httpClient;

    protected void sendAndValidate(
        final HttpRequest httpRequest
    ) throws NotificationSenderException, InterruptedException {
        final HttpResponse<String> response;
        try {
            response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        } catch (final IOException e) {
            throw new NotificationSenderException("Couldn't send HTTP request", receiverId(), e);
        }

        if (response.statusCode() != HttpStatus.OK.value()) {
            throw new NotificationSenderException(
                "Notification sender response didn't complete with 200 status code", receiverId());
        }
    }
}
