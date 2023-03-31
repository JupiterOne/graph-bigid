# Development

This integration was developed primarily using the documentation provided by
BigID at https://api.bigid.com/. Please reference it for questions specific to
any of their endpoints.

## Provider account setup

BigID provides a sandbox at https://sandbox.bigid.tools/api/v1/ that can be used
to test any changes to this integration.

## Authentication

We currently use user tokens to then generate a session token for
authentication. A user token for BigID's sandbox can be generated for use via a
small tool provided on this page
https://developer.bigid.com/wiki/BigID_API/API_Tutorial#Token_Authentication.

Documentation on session token authentication can be found at
https://api.bigid.com/index-session-tokens.html#post-/sessions
