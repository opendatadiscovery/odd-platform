package org.opendatadiscovery.oddplatform.service.attachment;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLink;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLinkFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLinkListFormData;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.mapper.LinkMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LinkPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.LinkRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL regression test for the link-attachment URL scheme allow-list (stored-XSS defense). A link URL is
 * persisted and later rendered as a clickable {@code <a href>}, so {@code LinkServiceImpl.save}/{@code update}
 * reject any scheme outside {http, https} with a {@link BadUserRequestException} (-> HTTP 400) BEFORE the
 * repository is touched. Positive allow-list per the OWASP XSS Prevention Cheat Sheet.
 *
 * <p>Supersedes the structural absence-pin {@code AttachmentLinkSchemeKnownBugTest} (retired on the fix per
 * retrospectives/LSN-029 — the known-bug coverage transforms into this regression test rather than vanishing).
 *
 * @validates F-027
 * @regresses GHSA-vw2p-vf4x-g3q6
 */
@ExtendWith(MockitoExtension.class)
class LinkServiceImplTest {

    private static final long DATA_ENTITY_ID = 42L;
    private static final long LINK_ID = 7L;

    @Mock
    private LinkRepository linkRepository;
    @Mock
    private LinkMapper linkMapper;

    private LinkServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new LinkServiceImpl(linkRepository, linkMapper);
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {
        "javascript:alert(document.cookie)",
        "JavaScript:alert(1)",
        "  javascript:alert(1)",
        "java\nscript:alert(1)",
        "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
        "vbscript:msgbox(1)",
        "file:///etc/passwd",
        "//evil.example.com",
        "ftp://legacy.example.com",
        "",
        "   ",
    })
    void update_disallowedScheme_isRejected_andNothingPersisted(final String url) {
        StepVerifier.create(service.update(LINK_ID, formData(url)))
            .verifyError(BadUserRequestException.class);
        verifyNoInteractions(linkRepository);
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {
        "javascript:alert(document.cookie)",
        "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
        "vbscript:msgbox(1)",
        "file:///etc/passwd",
    })
    void save_disallowedScheme_isRejected_andNothingPersisted(final String url) {
        StepVerifier.create(service.save(linkList(url), DATA_ENTITY_ID))
            .verifyError(BadUserRequestException.class);
        verify(linkRepository, never()).bulkCreate(anyList());
    }

    @Test
    void save_httpAndHttps_arePersisted() {
        final LinkPojo pojo = new LinkPojo();
        final DataEntityLink dto = new DataEntityLink();
        when(linkMapper.mapToPojo(any(), anyLong())).thenReturn(pojo);
        when(linkRepository.bulkCreate(anyList())).thenReturn(Flux.just(pojo, pojo));
        when(linkMapper.mapToDto(pojo)).thenReturn(dto);

        final DataEntityLinkListFormData form = new DataEntityLinkListFormData()
            .items(List.of(formData("http://example.com/runbook"), formData("https://dash.example.com/board")));

        StepVerifier.create(service.save(form, DATA_ENTITY_ID))
            .expectNext(dto, dto)
            .verifyComplete();
        verify(linkRepository).bulkCreate(anyList());
    }

    @Test
    void update_https_isPersisted() {
        final LinkPojo pojo = new LinkPojo();
        final DataEntityLink dto = new DataEntityLink();
        when(linkRepository.get(LINK_ID)).thenReturn(Mono.just(pojo));
        when(linkMapper.applyToPojo(any(), any())).thenReturn(pojo);
        when(linkRepository.update(pojo)).thenReturn(Mono.just(pojo));
        when(linkMapper.mapToDto(pojo)).thenReturn(dto);

        StepVerifier.create(service.update(LINK_ID, formData("https://wiki.example.com/page")))
            .expectNext(dto)
            .verifyComplete();
        verify(linkRepository).update(pojo);
    }

    private static DataEntityLinkFormData formData(final String url) {
        return new DataEntityLinkFormData().name("link").url(url);
    }

    private static DataEntityLinkListFormData linkList(final String url) {
        return new DataEntityLinkListFormData().items(List.of(formData(url)));
    }
}
