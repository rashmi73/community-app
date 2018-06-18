#!/bin/bash
set -eo pipefail

# Builds Docker image of Community App application.
# This script expects a single argument: NODE_CONFIG_ENV, which must be either
# "development" or "production".

NODE_CONFIG_ENV=$1

# Selects proper AWS_ACCOUNT_ID / AWS_REGION for dev / prod builds. Fails
# execution, if NODE_CONFIG_ENV argument is missing or incorrect.
if [ $NODE_CONFIG_ENV == production ]
then
  AWS_ACCOUNT_ID=$PROD_AWS_ACCOUNT_ID
  AWS_REGION=$PROD_AWS_REGION
  CDN_URL=$PROD_CDN_URL
  SERVER_API_KEY=$PROD_SERVER_API_KEY
  FILESTACK_API_KEY=$PROD_FILESTACK_API_KEY
  FILESTACK_SUBMISSION_CONTAINER=$PROD_FILESTACK_SUBMISSION_CONTAINER
  SEGMENT_IO_API_KEY=$PROD_SEGMENT_IO_API_KEY
  AWS_ECS_CLUSTER=$PROD_AWS_ECS_CLUSTER
elif [ $NODE_CONFIG_ENV == development ]
then
  AWS_ACCOUNT_ID=$DEV_AWS_ACCOUNT_ID
  AWS_REGION=$DEV_AWS_REGION
  CDN_URL=$DEV_CDN_URL
  SERVER_API_KEY=$DEV_SERVER_API_KEY
  FILESTACK_API_KEY=$DEV_FILESTACK_API_KEY
  FILESTACK_SUBMISSION_CONTAINER=$DEV_FILESTACK_SUBMISSION_CONTAINER
  SEGMENT_IO_API_KEY=$DEV_SEGMENT_IO_API_KEY
  AWS_ECS_CLUSTER=$DEV_AWS_ECS_CLUSTER
elif [ $NODE_CONFIG_ENV == test ]
then
  AWS_ACCOUNT_ID=$TEST_AWS_ACCOUNT_ID
  AWS_REGION=$TEST_AWS_REGION
  CDN_URL=$TEST_CDN_URL
  SERVER_API_KEY=$TEST_SERVER_API_KEY
  FILESTACK_API_KEY=$TEST_FILESTACK_API_KEY
  FILESTACK_SUBMISSION_CONTAINER=$TEST_FILESTACK_SUBMISSION_CONTAINER
  SEGMENT_IO_API_KEY=$TEST_SEGMENT_IO_API_KEY  
  AWS_ECS_CLUSTER=$TEST_AWS_ECS_CLUSTER
else
  exit 1
fi
echo "CDN URL"
echo $CDN_URL

# Builds Docker image of the app.
TAG=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$AWS_ECS_CLUSTER:$CIRCLE_SHA1
docker build -t $TAG \
  --build-arg CDN_URL=$CDN_URL \
  --build-arg CONTENTFUL_CDN_API_KEY=$CONTENTFUL_CDN_API_KEY \
  --build-arg CONTENTFUL_PREVIEW_API_KEY=$CONTENTFUL_PREVIEW_API_KEY \
  --build-arg CONTENTFUL_SPACE_ID=$CONTENTFUL_SPACE_ID \
  --build-arg NODE_CONFIG_ENV=$NODE_CONFIG_ENV \
  --build-arg SERVER_API_KEY=$SERVER_API_KEY \
  --build-arg FILESTACK_API_KEY=$FILESTACK_API_KEY \
  --build-arg FILESTACK_SUBMISSION_CONTAINER=$FILESTACK_SUBMISSION_CONTAINER \
  --build-arg COGNITIVE_NEWSLETTER_SIGNUP_APIKEY=$COGNITIVE_NEWSLETTER_SIGNUP_APIKEY \
  --build-arg COGNITIVE_NEWSLETTER_SIGNUP_URL=$COGNITIVE_NEWSLETTER_SIGNUP_URL \
  --build-arg SEGMENT_IO_API_KEY=$SEGMENT_IO_API_KEY .

# Copies "node_modules" from the created image, if necessary for caching.
docker create --name app $TAG

if [ -d node_modules ]
then
  # If "node_modules" directory already exists, we should compare
  # "package-lock.json" from the code and from the container to decide,
  # whether we need to re-cache, and thus to copy "node_modules" from
  # the Docker container.
  mv package-lock.json old-package-lock.json
  docker cp app:/opt/app/package-lock.json package-lock.json
  set +eo pipefail
  UPDATE_CACHE=$(cmp package-lock.json old-package-lock.json)
  set -eo pipefail
else
  # If "node_modules" does not exist, then cache must be created.
  UPDATE_CACHE=1
fi

if [ "$UPDATE_CACHE" == 1 ]
then
  docker cp app:/opt/app/node_modules .
fi
