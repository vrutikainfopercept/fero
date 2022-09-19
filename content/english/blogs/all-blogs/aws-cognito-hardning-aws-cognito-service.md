---
title: "Cognito - Hardning AWS Cognito Service"
page_header_bg: "images/banner/BenchmarkBanner.jpg"
slug: "hardning-aws-cognito-service"
date: 2022-03-31T15:27:17+06:00
draft: false
# Main description
image: "/images/blog/amazon-cognito.jpg"
bg_image: "/images/blog/amazon-cognito.jpg"
blogtitle: "Hardning AWS Cognito Service"
blogdescription: "Amazon Cognito is an Amazon Web Services product that controls user authentication and access for mobile applications..."
# meta description
description : "Performance and Load Testing, Penetration Testing, Deployment Architecture Review, Static Code Analysis"
metakeywords: "This is meta keywords"
categories: ["Amazon Web Services"]
tags: ["Custom Attributes", "AWS services", "Microsoft Entra", "JWT tokens", "Amazon S3",]
types: "blogs"
---


###

**In this post, we’ll cover…**

[Amazon Cognito](#amazon-cognito)

[Misconfigured User Pool Access](#misconfigured-user-pool-access)

[User Email And Phone Verification](#user-email-and-phone-verification)

[Leakage Identity Pool ID](#leakage-identity-pool-id)

[Refresh Token Timeout Configuration](#refresh-token-timeout-configuration)

[Session Invalidation After Logout](#session-invalidation-after-logout)

[Sync User Deactivation Status](#sync-user-deactivation-status)

[JWT Alone Is Not Full Proof Solution](#jwt-alone-is-not-full-proof-solution)

[Confirm The Structure Of The JWT](#confirm-the-structure-of-the-jwt)

[Why Do We Need To Care About Long Expiration Time For Oauth Tokens?](#why-do-we-need-to-care-about-long-expiration-time-for-oauth-tokens)

[Logout Doesn't Really Log You Out!](#logout-doesnt-really-log-you-out)

[Change Password Should Logout All User Sessions](#change-password-should-logout-all-user-sessions)

### Amazon Cognito ###

Amazon Cognito is an Amazon Web Services product that controls user authentication and access for mobile applications on internet-connected devices. It lets you add user sign-up, sign-in, and access control to your web and mobile apps quickly and easily. The service saves and synchronizes end-user data, which enables an application developer to focus on writing code instead of building and managing the back-end infrastructure. This can accelerate the mobile application development process. Amazon Cognito scales to millions of users and supports sign-in with social identity providers, such as Apple, Facebook, Google, and Amazon, and enterprise identity providers via SAML 2.0 and OpenID Connect.

Thus, with Cognito, a developer can:

+ Easily add user sign-up, sign-in and access control to their apps with its built-in user interface (UI) and easy configuration 
+ Federate identities from social identity providers 
+ Synchronize data across multiple devices and applications 
+ Provide secure access to other Amazon services from their app by defining roles and mapping users to different roles
  
Since Cognito handles all authentication requirements, developers can focus on creating apps and websites. This can accelerate the development process, shorten the release cycle, and speed up time to market and time to value. 

Amazon Cognito supports two types of authorization mechanisms:

+ **User pools:** User directories that provide sign-up and sign-in options for app users. 
+ **Identity pools:** Cognito elements grant users access to other Amazon services (e.g., Amazon S3 and DynamoDB).

In this article, out scope is limited to User pools and more specifically limited to hardening JWT token usage for specific scenarios explained later below. You can also read about quick **[Amazon Cognito - cheat-sheets (gitbook.io)](https://0xn3va.gitbook.io/cheat-sheets/cloud/aws/amazon-cognito).**

Why we should care about using Amazon Cognito:

![amazon-cognito-1](/images/blog/amazon-cognito-1.png)

Amazon Cognito provides standard and best way to allow app user signup and login functionality with various ways like OpenID Connect, SAML and social identity providers (such as Facebook, Twitter, Google, Microsoft) and you can also integrate your own identity provider.

For an additional layer of security, Amazon Cognito supports MFA and encrypts data at rest and in transit per industry standards. It is also compliant with numerous data protection standards and regulations, including:

+ HIPAA 
+ PCI DSS 
+ Service Organization Control 
+ ISO/IEC 27001/27017/27018 
+ ISO 9001

Amazon Cognito also supports a number of identity and access management (IAM) capabilities, including:

+ Identity-based policies 
+ Policy actions 
+ Temporary credentials 
+ Service roles 
+ Service-linked roles

The pricing for using Amazon Cognito services but it is worth comparing to managing our own user identity with respect to ease, security, and complexity if your workload is using Amazon Webservices. In this article, we are not scoping detailed analysis of how pricing will be calculated as the main focus is to have correct implementation only.

Amazon Cognito supports attributes. Attributes are pieces of information that help you identify individual users, such as name, email address, and phone number. A new user pool has a set of default standard attributes. You can also add custom attributes to your user pool definition in the Amazon Management Console.

Don't store all information about your users in attributes. For example, keep user data that changes frequently, such as usage statistics or game scores, in a separate data store, such as Amazon Cognito Sync or Amazon DynamoDB.

It is worth reading this for knowing about user pool attributes. The short description is as below:

+ Username and Preferred username: developer can use preferred username for username alias 
+ Aliases: You can mark the email address, phone number, and preferred username attributes as aliases
+ Standard Attributes: Amazon Cognito supports standard attributes based on OpenID Connect Specification.
+ Custom Attributes: You can add up to 50 custom attributes to your user pool.
  
I think we have covered little basic surface to understand about Amazon Cognito service. Now, let's quickly focus on common mistakes that might compromise your security.

Username case sensitivity:

By default, username is case sensitive. That means, user@example.com and User@example.com both are considered as separate username.

![amazon-cognito-2](/images/blog/amazon-cognito-2.png)

This feature was introduced in early 2020 and if you are using Amazon Cognito service already then there is no way to enable this feature as it might conflict your user pool. There is no automated migration path to change user pools from case-sensitive to case-insensitive. Migration to a new user pool requires scenario-based logic to handle conflicts. To make an existing user pool case insensitive, you can create a new user pool that is case insensitive, and then use the **[Migrate User Lambda Trigger](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-migrate-user.html)** to migrate existing users to the new pool. The trigger will allow you to migrate users at the time of sign-in or during the "forgot-password" flow. It will also allow you to handle conflicts. For more details, see the **[documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-import-using-lambda.html).**

### Misconfigured user pool access ###

If an application allows writing user attributes of an internally used AWS user pool, it can be used to abuse the trust between the application and the pool. In other words, it is possible to change the attributes and issue the JWT token, that will be used by an application. For instance, if an application uses normalized emails (in lower case), you can change one letter in an email address to an upper-case equivalent and takeover an account. You can learn more from **[Flickr Account Takeover](https://security.lauritz-holtmann.de/advisories/flickr-account-takeover/).**

### User email and phone verification ###

There is not strict requirement to use verified email and phone number of a user. It is highly recommended that email address and phone number should be verified to trust that user before allowing to access restricted resources.

### Leakage identity pool ID ###

Identity pool ID allows you to fetch temporary AWS credentials that may have extra AWS permissions. As a result, it may be possible to get unauthenticated access to sensitive AWS services. You can read **[this](https://blog.appsecco.com/exploiting-weak-configurations-in-amazon-cognito-in-aws-471ce761963)** to learn more.

### Refresh token timeout configuration ###

This is most common mistake when it comes to configure right session timeout settings from Amazon Cognito. By default, Amazon Cognito set 30 days for refresh token and 60 minutes for access token.

![amazon-cognito-3](/images/blog/amazon-cognito-3.png)

The below diagram will show how refresh token works:

![amazon-cognito-4](/images/blog/amazon-cognito-4.png)
In the diagram above, SPA = Single-Page Application; AS = Authorization Server; RS = Resource Server; AT = Access Token; RT = Refresh Token.

Reference: **[Microsoft identity platform refresh tokens - Microsoft Entra | Microsoft Docs](https://docs.microsoft.com/en-us/azure/active-directory/develop/refresh-tokens)**

![amazon-cognito-5](/images/blog/amazon-cognito-5.png)

You should use an appropriate lower expiration time for OAuth access and refresh tokens depending on your specific security requirements, so that they get purged quickly and thereby avoid accumulation. Set the expiration time for refresh tokens in such a way that it is valid for a little longer period than the access tokens. For example, if you set 30 minutes for access token then set (at least) 24 hours for the refresh token. As per my opinion, for web session, refresh token life should kept as one standard human shift (8 hours). So, if user forgets to logout system then it gets logged out automatically. There should be ample time to use a refresh token to generate new access and refresh tokens after the access token is expired. The refresh tokens should expire a little while later and can get purged in a timely manner to avoid accumulation.

### Session Invalidation After Logout ###

In web application, the sign out functionality might not implement properly. You should consume **[Amazon Amplify JS Framework](https://docs.amplify.aws/lib/auth/getting-started/q/platform/js/)** to achieve the correct functionality. This is the easiest way to work with Amazon Cognito in front end applications. You should [Enable token revocation](https://docs.aws.amazon.com/cognito/latest/developerguide/token-revocation.html) to enable Amazon Cognito service to revoke that session from user pool. That means, refresh token can not be used to get next access token. The already generated access token will continue to validate till its expiration time.

### Sync User deactivation status ###

User deactivation means, user will get deactivated from the Cognito as well as database. It is very essential for system to sync status of user activation flag whenever change is made.

### JWT alone is not full proof solution ###

I think, above information covers most common mistakes and recommendation to implement Amazon Cognito. But, we have to understand that AWS Cognito rely on JWT tokens and that are still possibilities for compromise your system. You can refer **[this link](https://redis.com/blog/json-web-tokens-jwt-are-dangerous-for-user-sessions/)** for more information.

![amazon-cognito-6](/images/blog/amazon-cognito-6.png)
Reference: **[Amazon Web Services](HTTPS://AWS.Amazon.com)**

![amazon-cognito-7](/images/blog/amazon-cognito-7.png)
Reference: **[Amazon Web Services](HTTPS://AWS.Amazon.com)**

See the flow of authentication and verification mechanism of standard JWT flow.

+ A user signs in through a user pool and receives user pool tokens (JWT tokens) after a successful authentication 
+ An application exchanges the user pool tokens for AWS credentials through the user pool 
+ The user can use the AWS credentials to access other AWS services such as Amazon S3 or DynamoDB

A JWT can be encrypted using either a symmetric key (shared secret) or asymmetric keys (the private key of a privatepublic pair). Symmetric key: The same key is used for both encryption (when the JWT is created) and decryption (Mobile Together Server uses the key to verify the JWT). Amazon Cognito service supports asymmetric keys (private public keys). The token validation steps are as below:

### Confirm the structure of the JWT ###

+ A JSON Web Token (JWT) includes three sections: Header, Payload and Signature.

Ex. 11111111111.22222222222.33333333333

These sections are encoded as base64url strings and are separated by dot (.) characters. If your JWT does not conform to this structure, consider it not valid and do not accept it.

+ Validate the JWT signature

The JWT signature is a hashed combination of the header and the payload. Amazon Cognito generates two pairs of RSA cryptographic keys for each user pool. One of the private keys is used to sign the token.

You can obtain public key information from JWKS endpoint.

https://cognito-idp.{region}.amazonaws.com/{userPoolid}/.well-known/iwks.json

In your application, it is best practice to cache key information on application booting time.

![amazon-cognito-8](/images/blog/amazon-cognito-8.png)

Verify Claims:

+ Verify the token is not expired 
+ The aud claim in an ID token and the client id claim in an access token should match the app client ID that was created in the Amazon Cognito user pool. 
+ The issuer (iss) claim should match your user pool. For example, a user pool created in the us-east-1 Region will have the following iss value: 
+ https://cognito-idp.us-east-1.amazonaws.com/<userpooliD>.
+ Check the token use claim.
  
  - If you are only accepting the access token in your web API operations, its value must be access.
  - If you are only using the ID token, its value must be id.
  - If you are using both ID and access tokens, the token use claim must be either id or access.

![amazon-cognito-9](/images/blog/amazon-cognito-9.png)

So, we can now enjoy focusing on application and stop worrying about authentication and authorization by Amazon Cognito service. But still there are certain situation where you might need more hardening service because of its nature of token verification without invoking authorization server.

1. Block active token and Revoke refresh token when admin disable user 
2. Block active token and Revoke refresh token when user logs out  
3. Block active token and Revoke refresh token (user session when user changes password

To solve this problem, we need to have some mechanism to store token data somewhere near to resource server for maintaining blacklisting token or session.

### Why do we need to care about long expiration time for OAuth tokens? ###

+ It Can Leads to significant growth of disk space usage on the data store (Cassandra). 
+ If it leaked somewhere, suppose on "GitHub" attacker will not be able to use that if its expired time is shorter

### Logout doesn't really log you out! ###

We need to change endpoint for logout to API level that will blacklist token and call "Global Sign Out" method of Amazon Cognito. On response to this, we should be redirecting user to another page where SignOut method calls with required cleanup of user session from client side.

### Change Password should logout all user sessions ###

Upon change password confirmation, the app should call "GlobalAdminSignOut" method to let user to sign out from all sessions across devices. We can use REDIS key for user with current time stamp and set expiry with refresh token expiry length. This way the key store will automatically clean up.

![amazon-cognito-10](/images/blog/amazon-cognito-10.png)

The authentication middleware would allow us to have consistent authentication across many services. The clients hold a session token that can be revoked, but the downstream services can still enjoy the benefits of JWT tokens.

**[https://doc.traefik.io/traefik/middlewares/http/forwardauth/](https://doc.traefik.io/traefik/middlewares/http/forwardauth/)**

![amazon-cognito-11](/images/blog/amazon-cognito-11.png)

![amazon-cognito-12](/images/blog/amazon-cognito-12.png)

We can keep using Cognito as a utility, but we are not bound by it. We and add other authentication mechanisms (such as API keys or SSO) without breaking the frontend.


###