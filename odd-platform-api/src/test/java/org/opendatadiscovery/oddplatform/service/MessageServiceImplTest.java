package org.opendatadiscovery.oddplatform.service;

import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.MessageMapper;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveMessageRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerRepository;
import org.opendatadiscovery.oddplatform.datacollaboration.service.MessageProviderUserProfileResolver;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for data-entity message threads — validates F-038 (Data Collaboration / Slack
 * Discussions): requesting the children of a message that does not exist errors NotFound. Exercised with
 * Mockito + StepVerifier. getChildrenMessages composes via eager .thenMany(listChildrenMessages(...)),
 * so that tail is poison-stubbed (subscribe-only) to prove the existence guard short-circuits before any
 * children are listed. No prior MessageServiceImpl unit test.
 *
 * @validates F-038
 */
@ExtendWith(MockitoExtension.class)
class MessageServiceImplTest {

    private static final UUID MESSAGE_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    @Mock private ReactiveMessageRepository reactiveMessageRepository;
    @Mock private MessageProviderUserProfileResolver userProfileResolver;
    @Mock private ReactiveOwnerRepository ownerRepository;
    @Mock private MessageMapper messageMapper;

    private MessageService service;

    @BeforeEach
    void setUp() {
        service = new MessageServiceImpl(reactiveMessageRepository, userProfileResolver, ownerRepository,
            messageMapper);
    }

    @Test
    void getChildrenMessages_nonExistentParent_errorsNotFound() {
        when(reactiveMessageRepository.exists(eq(MESSAGE_ID))).thenReturn(Mono.just(false));
        when(reactiveMessageRepository.listChildrenMessages(any(), any(), org.mockito.ArgumentMatchers.anyInt()))
            .thenReturn(Flux.error(new AssertionError("listed children despite the parent message not existing")));
        StepVerifier.create(service.getChildrenMessages(MESSAGE_ID, null, 10))
            .verifyError(NotFoundException.class);
    }
}
