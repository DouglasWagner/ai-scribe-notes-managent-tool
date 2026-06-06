#!/bin/sh
set -e

BUCKET_NAME="${AWS_S3_BUCKET:-scribe-audio}"

awslocal s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null ||
  awslocal s3api create-bucket --bucket "$BUCKET_NAME"
