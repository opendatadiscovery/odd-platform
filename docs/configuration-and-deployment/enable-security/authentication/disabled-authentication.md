# Disable authentication

ODD Platform allows to disable authentication at all. This is useful when you want to deploy platform locally and don't need any security configured. This is the default configuration and no additional settings are required.&#x20;

{% tabs %}
{% tab title="YAML" %}
```yaml
auth:
    type: DISABLED
```
{% endtab %}

{% tab title="Environment variables" %}
```
AUTH_TYPE=DISABLED
```
{% endtab %}
{% endtabs %}

{% hint style="danger" %}
**DO NOT** use this method in your production environment!
{% endhint %}
