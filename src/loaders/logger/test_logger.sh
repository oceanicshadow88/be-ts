#!/bin/bash

# Adjust these variables if your server runs on a different port or host,
# or if you mounted the test routes under a different prefix.
echo "HELLO WORLD" 
BASE_URL="http://localhost:8000"
ROUTE_PREFIX="/api/v2/logger"

ERROR_TYPES=(
  "basic"
  "statuscode"
  "validation_route"
  "customcontext_on_error"
  "service_basic"
  "service_context"
  "service_validation"
)

echo "Starting logger tests. Make sure your server is running at $BASE_URL"

for type in "${ERROR_TYPES[@]}"; do

  URL="${BASE_URL}${ROUTE_PREFIX}/error/${type}"
  echo "-----------------------------------------------------"
  echo "Hitting endpoint for error type: $type"
  echo "URL: $URL"
  # We use -s for silent, -o /dev/null to discard output, and -w "%{http_code}" to only print status code
  # We expect errors, so non-200 status codes are normal here.
  STATUS_CODE=$(curl -w "%{http_code}" "$URL")
  # STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL")

  echo "Response Status Code: $STATUS_CODE"
  echo "(Check your application logs for details of the logged error)"
#   # Optional: Add a small delay if your server/logger needs time
#   # sleep 1 
done

# echo "-----------------------------------------------------"
# echo "Logger tests complete." 