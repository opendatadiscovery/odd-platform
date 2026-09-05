package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetList;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormDataFilters;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.AssetSearchScope;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.MyDataScopeDto;
import org.opendatadiscovery.oddplatform.dto.MyDataScopeResult;
import org.opendatadiscovery.oddplatform.mapper.FacetStateMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveAssetSearchRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for the My-data wiring in {@link AssetSearchServiceImpl} (CTRIB-062 / #1842 ST-8): how
 * the request's scope tokens become an owner-resolved {@link AssetSearchScope}, and how the truncation signal
 * reaches the response.
 *
 * <p>Deliberately Mockito rather than Testcontainers: the SQL is covered by
 * {@code AssetSearchScopePredicateTest} and the walk by {@code MyDataScopeResolverTest}; what is left here is
 * pure decision logic — the back-compat alias, which scopes trigger an identity lookup at all, and the
 * fail-closed empty page. Mocking the identity provider also avoids a {@code @MockBean} Spring context, which
 * this repository's test suite has no precedent for.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("AssetSearchService My-data wiring (CTRIB-062 / #1842 ST-8)")
class AssetSearchServiceMyDataTest {

    @Mock private ReactiveAssetSearchRepository assetSearchRepository;
    @Mock private SearchAssetResolver searchAssetResolver;
    @Mock private FacetStateMapper facetStateMapper;
    @Mock private AuthIdentityProvider authIdentityProvider;
    @Mock private MyDataScopeResolver myDataScopeResolver;

    @InjectMocks private AssetSearchServiceImpl service;

    private static final long OWNER_ID = 42L;

    @Test
    @DisplayName("a legacy my_objects=true (no my_data) still means the owned scope — old links keep working")
    void legacyMyObjects_mapsToMyObjectsScope() {
        arrangeOwnerAndEmptyPage();

        service.searchAssets(form().myObjects(true), 30, null).block();

        final ArgumentCaptor<Set<MyDataScopeDto>> scopes = captorForScopes();
        verify(myDataScopeResolver).resolve(eq(OWNER_ID), scopes.capture(), anyInt(), anyInt());
        assertThat(scopes.getValue())
            .as("a bookmarked ?my=true URL or a saved search stored before ST-8 must resolve to MY_OBJECTS")
            .containsExactly(MyDataScopeDto.MY_OBJECTS);
        assertThat(capturedScope().myObjects()).isTrue();
        assertThat(capturedScope().lineageSelected()).isFalse();
    }

    @Test
    @DisplayName("my_data WINS over a legacy my_objects when both are present")
    void myDataSupersedesLegacyMyObjects() {
        arrangeOwnerAndEmptyPage();

        service.searchAssets(form().myObjects(true).myData(List.of("UPSTREAM")), 30, null).block();

        final ArgumentCaptor<Set<MyDataScopeDto>> scopes = captorForScopes();
        verify(myDataScopeResolver).resolve(eq(OWNER_ID), scopes.capture(), anyInt(), anyInt());
        assertThat(scopes.getValue()).containsExactly(MyDataScopeDto.UPSTREAM);
        assertThat(capturedScope().myObjects())
            .as("the new field is authoritative — the deprecated boolean must not silently re-add a scope")
            .isFalse();
    }

    @Test
    @DisplayName("an unknown scope token degrades to no scope — a stale shareable URL must not 400")
    void unknownScopeToken_isDroppedAndNoIdentityLookupHappens() {
        arrangeEmptyPage();

        service.searchAssets(form().myData(List.of("NONSENSE")), 30, null).block();

        verify(authIdentityProvider, never()).fetchAssociatedOwner();
        verify(myDataScopeResolver, never()).resolve(anyLong(), any(), anyInt(), anyInt());
    }

    @Test
    @DisplayName("per-direction depths reach the resolver independently; absent means the default of 1")
    void depthsArePassedPerDirection() {
        arrangeOwnerAndEmptyPage();

        service.searchAssets(
            form().myData(List.of("UPSTREAM", "DOWNSTREAM")).upstreamDepth(3), 30, null).block();

        verify(myDataScopeResolver).resolve(eq(OWNER_ID), any(), eq(3), eq(1));
    }

    @Test
    @DisplayName("a My-data scope with no resolvable owner returns an EMPTY page, never the full catalog")
    void noResolvableOwner_failsClosed() {
        when(facetStateMapper.mapForm(any(SearchFormData.class))).thenReturn(FacetStateDto.empty());
        when(authIdentityProvider.fetchAssociatedOwner()).thenReturn(Mono.empty());

        service.searchAssets(form().myData(List.of("MY_OBJECTS")), 30, null)
            .as(StepVerifier::create)
            .assertNext(list -> {
                assertThat(list.getItems()).isEmpty();
                assertThat(list.getPageInfo().getTotal())
                    .as("0, not the catalog total — the fail-closed direction (auth disabled, unbound user)")
                    .isEqualTo(0L);
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("a truncated scope is STAMPED on the response — a partial impact set must never read as complete")
    void truncationReachesTheResponse() {
        arrangeOwner();
        arrangeEmptyPage();
        when(myDataScopeResolver.resolve(anyLong(), any(), anyInt(), anyInt())).thenReturn(
            Mono.just(MyDataScopeResult.truncated(Set.of(7L), MyDataScopeResult.REASON_NODE_CAP)));

        final AssetList list = service.searchAssets(form().myData(List.of("DOWNSTREAM")), 30, null).block();

        assertThat(list.getPageInfo().getScopeTruncated())
            .as("the client cannot infer truncation; the server must declare it")
            .isTrue();
        assertThat(list.getPageInfo().getScopeTruncationReason())
            .as("NODE_CAP is the deterministic reason — it drives different copy from TIMEOUT")
            .isEqualTo(MyDataScopeResult.REASON_NODE_CAP);
    }

    // ---- arrangement ---------------------------------------------------------------------------------------

    private static AssetSearchFormData form() {
        return new AssetSearchFormData().query("q").filters(new SearchFormDataFilters());
    }

    private void arrangeOwner() {
        when(facetStateMapper.mapForm(any(SearchFormData.class))).thenReturn(FacetStateDto.empty());
        when(authIdentityProvider.fetchAssociatedOwner())
            .thenReturn(Mono.just(new OwnerPojo().setId(OWNER_ID)));
    }

    private void arrangeEmptyPage() {
        when(facetStateMapper.mapForm(any(SearchFormData.class))).thenReturn(FacetStateDto.empty());
        when(assetSearchRepository.relevancePage(any(), any(), any(), any(), any(), anyInt(), anyInt()))
            .thenReturn(Flux.empty());
        when(assetSearchRepository.keysetPage(any(), any(), any(), any(), any(), any(), anyInt()))
            .thenReturn(Flux.empty());
        when(assetSearchRepository.count(any(), any(), any(), any(), any())).thenReturn(Mono.just(0L));
        when(searchAssetResolver.resolve(any())).thenReturn(Mono.just(List.of()));
    }

    private void arrangeOwnerAndEmptyPage() {
        arrangeOwner();
        arrangeEmptyPage();
        when(myDataScopeResolver.resolve(anyLong(), any(), anyInt(), anyInt()))
            .thenReturn(Mono.just(MyDataScopeResult.empty()));
    }

    @SuppressWarnings("unchecked")
    private static ArgumentCaptor<Set<MyDataScopeDto>> captorForScopes() {
        return ArgumentCaptor.forClass((Class<Set<MyDataScopeDto>>) (Class<?>) Set.class);
    }

    private AssetSearchScope capturedScope() {
        final ArgumentCaptor<AssetSearchScope> captor = ArgumentCaptor.forClass(AssetSearchScope.class);
        verify(assetSearchRepository).count(any(), any(), captor.capture(), any(), any());
        return captor.getValue();
    }
}
