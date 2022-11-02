package org.opendatadiscovery.oddplatform.config;

import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.auth.ODDLDAPProperties;
import org.opendatadiscovery.oddplatform.auth.authorization.AuthorizationCustomizer;
import org.opendatadiscovery.oddplatform.auth.manager.extractor.ResourceExtractor;
import org.opendatadiscovery.oddplatform.auth.mapper.GrantedAuthorityExtractor;
import org.opendatadiscovery.oddplatform.service.permission.PermissionService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.ldap.core.ContextSource;
import org.springframework.ldap.core.LdapTemplate;
import org.springframework.ldap.core.support.LdapContextSource;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.ReactiveAuthenticationManagerAdapter;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper;
import org.springframework.security.ldap.authentication.AbstractLdapAuthenticationProvider;
import org.springframework.security.ldap.authentication.BindAuthenticator;
import org.springframework.security.ldap.authentication.LdapAuthenticationProvider;
import org.springframework.security.ldap.authentication.ad.ActiveDirectoryLdapAuthenticationProvider;
import org.springframework.security.ldap.search.FilterBasedLdapUserSearch;
import org.springframework.security.ldap.search.LdapUserSearch;
import org.springframework.security.ldap.userdetails.DefaultLdapAuthoritiesPopulator;
import org.springframework.security.ldap.userdetails.LdapAuthoritiesPopulator;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.util.matcher.PathPatternParserServerWebExchangeMatcher;

import static org.opendatadiscovery.oddplatform.dto.security.UserProviderRole.USER;
import static org.opendatadiscovery.oddplatform.utils.OperationUtils.containsIgnoreCase;

@Configuration
@ConditionalOnProperty(value = "auth.type", havingValue = "LDAP")
@EnableConfigurationProperties(ODDLDAPProperties.class)
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
@RequiredArgsConstructor
@Slf4j
public class LDAPSecurityConfiguration {
    private final ODDLDAPProperties properties;

    @Bean
    public ReactiveAuthenticationManager authenticationManager(final LdapContextSource contextSource,
                                                               final LdapAuthoritiesPopulator authoritiesPopulator,
                                                               final GrantedAuthoritiesMapper authoritiesMapper) {
        final BindAuthenticator ba = new BindAuthenticator(contextSource);
        if (StringUtils.isNotEmpty(properties.getDnPattern())) {
            ba.setUserDnPatterns(new String[] {properties.getDnPattern()});
        } else if (properties.getUserFilter() != null
            && StringUtils.isNotEmpty(properties.getUserFilter().getFilter())) {
            final LdapUserSearch userSearch =
                new FilterBasedLdapUserSearch(properties.getUserFilter().getSearchBase(),
                    properties.getUserFilter().getFilter(), contextSource);
            ba.setUserSearch(userSearch);
        }

        final AbstractLdapAuthenticationProvider ap;
        if (properties.getActiveDirectory() != null && properties.getActiveDirectory().isEnabled()) {
            ap = new ActiveDirectoryLdapAuthenticationProvider(properties.getActiveDirectory().getDomain(),
                properties.getUrl());
            ap.setUseAuthenticationRequestCredentials(true);
        } else {
            ap = new LdapAuthenticationProvider(ba, authoritiesPopulator);
        }
        ap.setAuthoritiesMapper(authoritiesMapper);
        final AuthenticationManager am = new ProviderManager(List.of(ap));
        return new ReactiveAuthenticationManagerAdapter(am);
    }

    @Bean
    public GrantedAuthoritiesMapper authoritiesMapper(final GrantedAuthorityExtractor extractor) {
        if (properties.getGroups() != null && CollectionUtils.isEmpty(properties.getGroups().getAdminGroups())) {
            return authorities -> Set.of(new SimpleGrantedAuthority(USER.name()));
        }
        return (authorities) -> {
            final boolean isAdmin = authorities.stream()
                .anyMatch(a -> containsIgnoreCase(properties.getGroups().getAdminGroups(), a.getAuthority()));
            return extractor.getAuthorities(isAdmin);
        };
    }

    @Bean
    public LdapAuthoritiesPopulator authoritiesPopulator(final LdapContextSource contextSource) {
        final String groupsSearchBase = properties.getGroups() != null
            && StringUtils.isNotEmpty(properties.getGroups().getSearchBase())
            ? properties.getGroups().getSearchBase() : "";
        final DefaultLdapAuthoritiesPopulator authorities =
            new DefaultLdapAuthoritiesPopulator(contextSource, groupsSearchBase);
        authorities.setRolePrefix("");
        if (properties.getGroups() != null && StringUtils.isNotEmpty(properties.getGroups().getFilter())) {
            authorities.setGroupSearchFilter(properties.getGroups().getFilter());
        }
        authorities.setSearchSubtree(true);
        return authorities;
    }

    @Bean
    public LdapContextSource ldapContextSource() {
        final LdapContextSource ctx = new LdapContextSource();
        ctx.setUrl(properties.getUrl());
        ctx.setUserDn(properties.getUsername());
        ctx.setPassword(properties.getPassword());
        return ctx;
    }

    @Bean
    public LdapTemplate ldapTemplate(final ContextSource contextSource) {
        final LdapTemplate ldapTemplate = new LdapTemplate(contextSource);
        ldapTemplate.setIgnorePartialResultException(false);
        ldapTemplate.setIgnoreNameNotFoundException(false);
        ldapTemplate.setIgnoreSizeLimitExceededException(true);
        return ldapTemplate;
    }

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public SecurityWebFilterChain configureLdap(final ServerHttpSecurity http,
                                                final List<ResourceExtractor> extractors,
                                                final PermissionService permissionService) {
        return http
            .cors().and()
            .csrf().disable()
            .securityMatcher(new PathPatternParserServerWebExchangeMatcher("/**"))
            .authorizeExchange(new AuthorizationCustomizer(permissionService, extractors))
            .logout()
            .and()
            .formLogin()
            .and().build();
    }
}

