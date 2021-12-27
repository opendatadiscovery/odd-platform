package org.opendatadiscovery.oddplatform.config;

import java.util.List;
import lombok.extern.slf4j.Slf4j;
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
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.ldap.authentication.BindAuthenticator;
import org.springframework.security.ldap.authentication.LdapAuthenticationProvider;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.util.matcher.PathPatternParserServerWebExchangeMatcher;

@Configuration
@EnableWebFluxSecurity
@ConditionalOnProperty(value = "auth.type", havingValue = "LDAP")
@Slf4j
public class LDAPSecurityConfiguration {

    @Value("${spring.ldap.urls}")
    private String ldapUrls;
    @Value("${spring.ldap.dn.pattern}")
    private String ldapUserDnPattern;

    @Bean
    public ReactiveAuthenticationManager authenticationManager(final BaseLdapPathContextSource contextSource) {
        final BindAuthenticator ba = new BindAuthenticator(contextSource);
        ba.setUserDnPatterns(new String[] {ldapUserDnPattern});

        final LdapAuthenticationProvider lap = new LdapAuthenticationProvider(ba);

        final AuthenticationManager am = new ProviderManager(List.of(lap));

        return new ReactiveAuthenticationManagerAdapter(am);
    }

    @Bean
    public BaseLdapPathContextSource contextSource() {
        final LdapContextSource ctx = new LdapContextSource();
        ctx.setUrl(ldapUrls);
        ctx.afterPropertiesSet();
        return ctx;
    }

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public SecurityWebFilterChain configureLdap(final ServerHttpSecurity http) {
        log.info("Configuring LDAP authentication.");

        http
            .cors().and()
            .csrf().disable()
            .securityMatcher(new PathPatternParserServerWebExchangeMatcher("/**"))
            .authorizeExchange(e -> e
                .pathMatchers("/health", "/favicon.ico").permitAll()
                .pathMatchers("/**").authenticated())
            .logout()
            .and()
            .httpBasic();

        return http.build();
    }
}

