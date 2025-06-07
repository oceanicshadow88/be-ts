#!/bin/bash

# =================================================================================
#      Curl Commands for Testing Error Logging in Your Application
# =================================================================================
#
# INSTRUCTIONS:
# 1. Make sure your local server is running (e.g., `npm run dev`).
# 2. Open a new terminal.
# 3. Replace `<YOUR_TENANT_ORIGIN>` with a valid tenant origin from your local
#    database (e.g., http://my-tenant.localhost:3000). The saasMiddleware uses
#    this `Origin` header to find the correct database.
# 4. For authenticated routes, replace `<YOUR_JWT_TOKEN>` with a valid token
#    for a user in that tenant's database.
# 5. Run this script using `bash ./test-error-curls.sh` and check the application 
#    logs (both console and the winston log files) to see the detailed error output.
#
# =================================================================================

# --- Set your variables here ---
BASE_URL="http://localhost:8000/api/v2"
# IMPORTANT: Change this to a real tenant origin for your local setup
TENANT_ORIGIN="http://mytenant.localhost:3000"
# IMPORTANT: Change this to a real JWT token after logging in
JWT_TOKEN="<YOUR_JWT_TOKEN>"


# =================================================================================
# 1. Login Route: Validation Error
# =================================================================================
#
# This command attempts to log in with an empty body.
# It should fail because the `loginValidation.login` middleware expects
# fields like 'email' and 'password'.
#
# Expected Error: 400 Bad Request with validation errors in the response.
# Log Output: Will show a detailed validation error from winston in your terminal/log file.

echo "--- [1/5] Testing Login Validation Error ---"
curl -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -H "Origin: $TENANT_ORIGIN" \
  -d '{}'
echo -e "\n\n"


# =================================================================================
# 2. Create Project: Authentication Error
# =================================================================================
#
# This command tries to create a project without an Authorization header.
# It should be rejected by the `authenticationTokenMiddleware`.
#
# Expected Error: 401 Unauthorized.
# Log Output: This error is often sent directly by the auth middleware and may
# not be caught by your global async error handler, but it's a good test case.

echo "--- [2/5] Testing Project Creation (Auth Error) ---"
curl -X POST "$BASE_URL/projects" \
  -H "Content-Type: application/json" \
  -H "Origin: $TENANT_ORIGIN" \
  -d '{"name": "This Should Fail"}'
echo -e "\n\n"


# =================================================================================
# 3. Create Project: Validation Error (Authenticated)
# =================================================================================
#
# This command sends a valid JWT but an empty body for creating a project.
# It should pass authentication but fail at the `projectValidation.store` step.
# This tests the logger for validation errors on a protected route.
#
# Expected Error: 400 Bad Request with validation errors.
# Log Output: Will show a detailed validation error, including a `sourceFile`
# and `apiRoute`.

echo "--- [3/5] Testing Project Creation (Validation Error) ---"
curl -X POST "$BASE_URL/projects" \
  -H "Content-Type: application/json" \
  -H "Origin: $TENANT_ORIGIN" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{}'
echo -e "\n\n"


# =================================================================================
# 4. Create Comment: Validation Error
# =================================================================================
#
# This command attempts to create a comment with an empty body.
# The `commentValidation.store` middleware will reject it for missing fields
# like 'text' and 'ticketId'. This also requires authentication.
#
# Expected Error: 400 Bad Request with validation errors.
# Log Output: A detailed winston log for the validation failure.

echo "--- [4/5] Testing Comment Creation (Validation Error) ---"
curl -X POST "$BASE_URL/comments" \
  -H "Content-Type: application/json" \
  -H "Origin: $TENANT_ORIGIN" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{}'
echo -e "\n\n"

# =================================================================================
# 5. Reset Password: Validation Error
# =================================================================================
#
# This command attempts to request a password reset with an invalid email.
# The `forgetPasswordValidation.forgetPasswordApplication` middleware will
# likely reject it. This is a good test for a public-facing endpoint.
#
# Expected Error: 400 Bad Request with validation errors.
# Log Output: A detailed winston log for the validation failure.

echo "--- [5/5] Testing Reset Password (Validation Error) ---"
curl -X POST "$BASE_URL/reset-password" \
  -H "Content-Type: application/json" \
  -H "Origin: $TENANT_ORIGIN" \
  -d '{"email": "not-an-email"}'
echo -e "\n" 





# echo -e "===== Simulating CastErrors =====\n\n"

# # === Activities ===
# echo -e "curl $BASE_URL/activities/123"
# curl "$BASE_URL/activities/123"


# # === Projects ===
# echo -e "\n\n\n --- [6/5] Testing Project Details (Validation Error) ---\n"

# echo -e "curl $BASE_URL/projects/123"
# curl "$BASE_URL/projects/123"

# echo -e "\n\ncurl $BASE_URL/projects/123/details"
# curl "$BASE_URL/projects/123/details"

# echo -e "\n\ncurl PUT projects/123"
# curl -X PUT "$BASE_URL/projects/123" -d '{}' -H "Content-Type: application/json"

# echo -e "\n\ncurl DELETE projects/123"
# curl -X DELETE "$BASE_URL/projects/123"

# echo -e "\n\n=== Project Members ===\n"

# echo -e "curl PUT projects/123/members/invalid-id"
# curl -X PUT "$BASE_URL/projects/123/members/invalid-id" -d '{}' -H "Content-Type: application/json"

echo -e "\n\ncurl DELETE projects/123/members/invalid-id"
curl -X DELETE "$BASE_URL/projects/123/members/invalid-id"

# === Project Roles ===
echo -e "\n\n=== Project Roles ===\n"

# echo -e "curl GET projects/invalid-id/roles/invalid-id"
# curl "$BASE_URL/projects/invalid-id/roles/invalid-id"

echo -e "\n\ncurl PUT projects/123/roles/invalid-id"
curl -X PUT "$BASE_URL/projects/123/roles/invalid-id" -d '{}' -H "Content-Type: application/json"

echo -e "\n\ncurl DELETE projects/123/roles/invalid-id"
curl -X DELETE "$BASE_URL/projects/123/roles/invalid-id"

# # === Labels on Tickets ===
# curl -X POST "$BASE_URL/tickets/invalid-id/labels" -d '{}' -H "Content-Type: application/json"
# curl -X DELETE "$BASE_URL/tickets/invalid-id/labels/invalid-label-id"

# # === Retro Items ===
# curl -X PUT "$BASE_URL/retro/items/invalid-id" -d '{}' -H "Content-Type: application/json"
# curl -X DELETE "$BASE_URL/retro/items/invalid-id"

# # === Sprints ===
# curl -X PUT "$BASE_URL/sprints/invalid-id" -d '{}' -H "Content-Type: application/json"
# curl -X DELETE "$BASE_URL/sprints/invalid-id"

# # === Daily Scrums ===
# curl -X DELETE "$BASE_URL/projects/invalid-id/dailyScrums"
# curl -X PATCH "$BASE_URL/projects/invalid-id/dailyScrums/invalid-id" -d '{}' -H "Content-Type: application/json"

# echo "===== Finished ====="
