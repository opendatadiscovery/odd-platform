# Login form

This is the simplest form of authentication provided by ODD Platform.&#x20;

User credentials can be set by defining `auth.login-form-credentials` variable in the following format: `username1:password1,username2:password2.`&#x20;

Default value is `admin:admin,root:root`, hence by default ODD Platform will be able to authenticate 2 users with usernames `admin` and `root` and passwords `admin` and `root` respectively.

All users will have ADMIN priviligies in platform.

{% tabs %}
{% tab title="YAML" %}
```yaml
auth:
    type: LOGIN_FORM
    login-form-credentials: susan:susan_password,dave:dave_password
```
{% endtab %}

{% tab title="Environment variables" %}
```
AUTH_TYPE=LOGIN_FORM
AUTH_LOGIN-FORM-CREDENTIALS=susan:susan_password,dave:dave_password
```
{% endtab %}
{% endtabs %}

{% hint style="danger" %}
We don't recommend to use **`LOGIN_FORM`** authentication mechanism in production!
{% endhint %}
