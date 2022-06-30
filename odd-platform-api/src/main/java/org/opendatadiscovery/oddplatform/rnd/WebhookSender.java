package org.opendatadiscovery.oddplatform.rnd;

import reactor.core.publisher.Mono;

public interface WebhookSender {
    Mono<Void> send(final String webhookUrl, final String message);
}
