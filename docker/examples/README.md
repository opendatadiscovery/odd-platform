## Additional ODD Platform features

### Authentication

Enabling authentication will bring additional features such as:

1. `User identity mapping`
2. `My Objects`
3. `Upstream/Downstream dependencies`

ODD Platform has several supported authentication mechanisms. By default, the authentication is **disabled**

#### Form Login

To enable Form Login authentication mechanism, set `AUTH_TYPE=LOGIN_FORM` environment variable in **odd-platform** docker-compose service.

Credentials are: `root:root` or `admin:admin`. These can be changed via `AUTH_LOGIN_FORM_CREDENTIALS` environment variable in format `username1:password1,username2:password2`

### OAuth2

To enable OAuth2 authentication mechanism:

1. Set `AUTH_TYPE=OAUTH2` environment variable in **odd-platform** docker-compose service
3. Configure OAuth2 + OIDC
   using [this reference page](https://docs.spring.io/spring-security/site/docs/5.2.x/reference/html/oauth2.html#oauth2)
   via environment variables in ODD Platform docker-compose service
4. Configure OAuth2 Authorization Server's issuer URL by setting `SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER_URL`
   property via environment variables in ODD Platform docker-compose service
5. Configure OAuth2 section in ODD Platform Puller service using
   this [reference](https://github.com/opendatadiscovery/odd-platform-puller#readme)