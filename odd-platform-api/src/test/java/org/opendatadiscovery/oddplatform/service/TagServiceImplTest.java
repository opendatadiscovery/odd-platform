package org.opendatadiscovery.oddplatform.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.TagFormData;
import org.opendatadiscovery.oddplatform.dto.TagDto;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.TagMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTagRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermSearchEntrypointRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for the Tag lifecycle — validates F-018 (Manual Object Tagging): a tag with
 * EXTERNAL relations is protected (update AND delete error BadUserRequest), and update/delete of a missing
 * tag error NotFoundException. Exercised with Mockito + StepVerifier. delete() composes via eager
 * .thenMany(Flux.zip(deleteTermRelations, deleteDataEntityRelations)).then(delete), so those are
 * poison-stubbed (subscribe-only) to prove the guard short-circuits before any relation/tag deletion.
 * No prior TagServiceImpl unit test.
 *
 * @validates F-018
 */
@ExtendWith(MockitoExtension.class)
class TagServiceImplTest {

    private static final long TAG_ID = 1L;

    @Mock private ReactiveTagRepository reactiveTagRepository;
    @Mock private TagMapper tagMapper;
    @Mock private ReactiveSearchEntrypointRepository reactiveSearchEntrypointRepository;
    @Mock private ReactiveTermSearchEntrypointRepository reactiveTermSearchEntrypointRepository;

    private TagService service;

    @BeforeEach
    void setUp() {
        service = new TagServiceImpl(reactiveTagRepository, tagMapper, reactiveSearchEntrypointRepository,
            reactiveTermSearchEntrypointRepository);
    }

    private static TagDto externalTag() {
        return new TagDto(new TagPojo().setName("ext"), 0L, true);
    }

    private void poisonDeleteTail() {
        when(reactiveTagRepository.deleteTermRelations(anyLong()))
            .thenReturn(Flux.error(new AssertionError("deleted term relations despite an earlier guard")));
        when(reactiveTagRepository.deleteDataEntityRelations(anyLong()))
            .thenReturn(Flux.error(new AssertionError("deleted data-entity relations despite an earlier guard")));
        when(reactiveTagRepository.delete(anyLong()))
            .thenReturn(Mono.error(new AssertionError("deleted tag despite an earlier guard")));
    }

    @Test
    void update_nonExistentTag_errorsNotFound() {
        when(reactiveTagRepository.getDto(eq(TAG_ID))).thenReturn(Mono.empty());
        StepVerifier.create(service.update(TAG_ID, new TagFormData())).verifyError(NotFoundException.class);
    }

    @Test
    void update_externalTag_errorsBadRequestNotEditable() {
        when(reactiveTagRepository.getDto(eq(TAG_ID))).thenReturn(Mono.just(externalTag()));
        StepVerifier.create(service.update(TAG_ID, new TagFormData())).verifyError(BadUserRequestException.class);
    }

    @Test
    void delete_nonExistentTag_errorsNotFound() {
        when(reactiveTagRepository.getDto(eq(TAG_ID))).thenReturn(Mono.empty());
        poisonDeleteTail();
        StepVerifier.create(service.delete(TAG_ID)).verifyError(NotFoundException.class);
    }

    @Test
    void delete_externalTag_errorsBadRequestNotDeletable() {
        when(reactiveTagRepository.getDto(eq(TAG_ID))).thenReturn(Mono.just(externalTag()));
        poisonDeleteTail();
        StepVerifier.create(service.delete(TAG_ID)).verifyError(BadUserRequestException.class);
    }
}
