package org.opendatadiscovery.oddplatform.config;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.auth.manager.OwnerBasedReactiveAuthorizationManager;
import org.opendatadiscovery.oddplatform.auth.mapper.GrantedAuthorityExtractor;
import org.opendatadiscovery.oddplatform.auth.util.SecurityConstants;
import org.opendatadiscovery.oddplatform.dto.security.UserRole;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.ldap.core.support.BaseLdapPathContextSource;
import org.springframework.ldap.core.support.LdapContextSource;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.ReactiveAuthenticationManagerAdapter;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
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

import static org.opendatadiscovery.oddplatform.utils.OperationUtils.containsIgnoreCase;

@Configuration
@ConditionalOnProperty(value = "auth.type", havingValue = "LDAP")
@EnableReactiveMethodSecurity
@Slf4j
public class LDAPSecurityConfiguration {

    @Value("${spring.ldap.url}")
    private String ldapUrl;
    @Value("${spring.ldap.dn.patterns}")
    private List<String> ldapUserDnPatterns;

    @Value("${spring.ldap.adminUser:}")
    private String adminUser;
    @Value("${spring.ldap.adminPassword:}")
    private String adminPassword;
    @Value("${spring.ldap.user-filter.search-base:}")
    private String userFilterSearchBase;
    @Value("${spring.ldap.user-filter.filter:}")
    private String userFilterSearchFilter;

    @Value("${spring.ldap.groups.search-base:''}")
    private String groupsSearchBase;
    @Value("${spring.ldap.groups.filter:''}")
    private String groupsSearchFilter;
    @Value("${spring.ldap.groups.admin-groups:}")
    private Set<String> adminGroups;

    @Value("${spring.ldap.active-directory.enabled:false}")
    private boolean isActiveDirectory;
    @Value("${spring.ldap.active-directory.domain:}")
    private String domain;

    @Bean
    public ReactiveAuthenticationManager authenticationManager(final BaseLdapPathContextSource contextSource,
                                                               final LdapAuthoritiesPopulator authoritiesPopulator,
                                                               final GrantedAuthoritiesMapper authoritiesMapper) {
        final BindAuthenticator ba = new BindAuthenticator(contextSource);
        if (CollectionUtils.isNotEmpty(ldapUserDnPatterns)) {
            ba.setUserDnPatterns(ldapUserDnPatterns.toArray(String[]::new));
        }
        if (userFilterSearchFilter != null) {
            final LdapUserSearch userSearch =
                new FilterBasedLdapUserSearch(userFilterSearchBase, userFilterSearchFilter, contextSource);
            ba.setUserSearch(userSearch);
        }

        final AbstractLdapAuthenticationProvider ap;
        if (isActiveDirectory) {
            ap = new ActiveDirectoryLdapAuthenticationProvider(domain, ldapUrl);
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
        if (CollectionUtils.isEmpty(adminGroups)) {
            return authorities -> Set.of();
        }
        return (authorities) -> {
            final Set<UserRole> roles = authorities.stream()
                .filter(a -> containsIgnoreCase(adminGroups, a.getAuthority()))
                .map(a -> UserRole.ROLE_ADMIN)
                .collect(Collectors.toSet());
            return extractor.getAuthoritiesByUserRoles(roles);
        };
    }

    @Bean
    public LdapAuthoritiesPopulator authoritiesPopulator(final BaseLdapPathContextSource contextSource) {
        final DefaultLdapAuthoritiesPopulator authorities =
            new DefaultLdapAuthoritiesPopulator(contextSource, groupsSearchBase);
        authorities.setRolePrefix("");
        if (groupsSearchFilter != null) {
            authorities.setGroupSearchFilter(groupsSearchFilter);
        }
        authorities.setSearchSubtree(true);
        return authorities;
    }

    @Bean
    public BaseLdapPathContextSource contextSource() {
        final LdapContextSource ctx = new LdapContextSource();
        ctx.setUrl(ldapUrl);
        ctx.setUserDn(adminUser);
        ctx.setPassword(adminPassword);
        ctx.afterPropertiesSet();
        return ctx;
    }

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public SecurityWebFilterChain configureLdap(final ServerHttpSecurity http,
                                                final OwnerBasedReactiveAuthorizationManager authManager) {
        return http
            .cors().and()
            .csrf().disable()
            .securityMatcher(new PathPatternParserServerWebExchangeMatcher("/**"))
            .authorizeExchange(e -> e
                .pathMatchers(SecurityConstants.WHITELIST_PATHS)
                .permitAll()
                .matchers(SecurityConstants.OWNER_ACCESS_PATHS)
                .access(authManager)
                .pathMatchers("/**").authenticated())
            .logout()
            .and()
            .formLogin()
            .and().build();
    }
}

