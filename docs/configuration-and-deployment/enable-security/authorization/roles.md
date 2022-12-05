# Roles

Role is useful for combining multiple policies together. There are 2 type of roles in ODD Platform:

* User roles
* Owner roles

#### User roles

There are 2 user roles:

* USER - regular user which don't have any permissions by default
* ADMIN - administrator, who has all permissions

User role is defined via properties, when you configure Authentication method. (e.g. admin groups for AWS Cognito or admin team in GitHub). If user matches admin condition he will have ADMIN role, otherwise he will be assigned USER role.

#### Owner roles

Owner roles can be managed in ODD Platform via `Management - Roles` section. As the name implies, these roles are assigned to [owners.md](owners.md "mention"), not to users.&#x20;

When user is associated with owner (please check [user-owner-association.md](user-owner-association.md "mention")section for more details) he will inherit owner roles, ignoring previously assigned user roles, e.g. user was logged in and got ADMIN role. After that he associated himself with owner, which has Data Engineer role. He will lose his admin priviligies and have Data engineer role.

{% hint style="warning" %}
Be careful and don't associate user with admin role with non-admin owner. You need to create owner with admin role first and then associate your admin user with this owner.
{% endhint %}
