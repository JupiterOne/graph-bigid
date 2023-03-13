# Development

This integration was developed primarily using the documentation provided by
BigID at https://api.bigid.com/. Please reference it for questions specific to
any of their endpoints.

## Provider account setup

BigID provides a sandbox at https://sandbox.bigid.tools/api/v1/ that can be used
to test any changes to this integration.

## Authentication

We currently use session tokens for authentication using username and password
for the initial authentication. The session lasts for 24 hours, so it should not
need to be renewed unless we end up with very long running jobs.

Documentation on session token authentication can be found at
https://api.bigid.com/index-session-tokens.html#post-/sessions
