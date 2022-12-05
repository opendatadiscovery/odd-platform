# User-owner association

User-owner association is an important part of using ODD Platform. If user doesn't have association with any [owner](owners.md), it's impossible to him to manage data entities or have owner-based security role.&#x20;

There are 2 ways of association process - for admins and for regular users. We will cover both of them in details below.

### Admin

Association process for admins is straightforward.&#x20;

1. After logging in you will see modal dialog in the bottom of the main page
2. Select owner which you want to associate yourself with and press `Associate` button.

### User

Association process for regular users is a bit more complicated and involves a few more steps

1. After logging in you will see the same modal dialog as admins in the bottom of the main page
2. Select owner which you want to associate yourself with and press `Send request` button.
3. In `Management` section under `Associations` tab admin user will see your association request.
4. Admin should approve request for finishing association process or deny it if there are any issues with current request.

After all these steps user will have an associated owner which can be used across the platform.

{% hint style="info" %}
User-owner relation is one-to-one relation, which means, that one user can be associated only with one owner and vice versa.
{% endhint %}
