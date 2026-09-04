package org.opendatadiscovery.oddplatform.controller;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.SavedSearch;
import org.opendatadiscovery.oddplatform.api.contract.model.SavedSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SavedSearchList;
import org.opendatadiscovery.oddplatform.service.SavedSearchService;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for SavedSearchController (issue #1837 / ST-3): the controller delegates to the service
 * and maps the result to the documented HTTP contract — 201 Created on save, 200 on list/update, 204 on delete.
 * The service is mocked.
 */
@ExtendWith(MockitoExtension.class)
class SavedSearchControllerTest {

    @Mock private SavedSearchService savedSearchService;

    private SavedSearchController controller;

    @BeforeEach
    void setUp() {
        controller = new SavedSearchController(savedSearchService);
    }

    @Test
    void createSavedSearch_delegatesAndReturns201() {
        final SavedSearchFormData form = form("My orders");
        final SavedSearch saved = new SavedSearch().id(1L).name("My orders");
        when(savedSearchService.create(form)).thenReturn(Mono.just(saved));

        StepVerifier.create(controller.createSavedSearch(Mono.just(form), exchange()))
            .assertNext(response -> {
                assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
                assertThat(response.getBody()).isSameAs(saved);
            })
            .verifyComplete();
        verify(savedSearchService).create(form);
    }

    @Test
    void getSavedSearchList_delegatesAndReturns200() {
        final SavedSearchList list = new SavedSearchList()
            .items(List.of())
            .pageInfo(new PageInfo().total(0L).hasNext(false));
        when(savedSearchService.list(1, 20)).thenReturn(Mono.just(list));

        StepVerifier.create(controller.getSavedSearchList(1, 20, exchange()))
            .assertNext(response -> {
                assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
                assertThat(response.getBody()).isSameAs(list);
            })
            .verifyComplete();
        verify(savedSearchService).list(1, 20);
    }

    @Test
    void updateSavedSearch_delegatesAndReturns200() {
        final SavedSearchFormData form = form("renamed");
        final SavedSearch saved = new SavedSearch().id(5L).name("renamed");
        when(savedSearchService.update(5L, form)).thenReturn(Mono.just(saved));

        StepVerifier.create(controller.updateSavedSearch(5L, Mono.just(form), exchange()))
            .assertNext(response -> {
                assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
                assertThat(response.getBody()).isSameAs(saved);
            })
            .verifyComplete();
        verify(savedSearchService).update(5L, form);
    }

    @Test
    void deleteSavedSearch_delegatesAndReturns204() {
        when(savedSearchService.delete(7L)).thenReturn(Mono.empty());

        StepVerifier.create(controller.deleteSavedSearch(7L, exchange()))
            .assertNext(response -> assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT))
            .verifyComplete();
        verify(savedSearchService).delete(7L);
    }

    private static SavedSearchFormData form(final String name) {
        return new SavedSearchFormData().name(name).spec(new AssetSearchFormData());
    }

    private static MockServerWebExchange exchange() {
        return MockServerWebExchange.from(MockServerHttpRequest.get("/"));
    }
}
