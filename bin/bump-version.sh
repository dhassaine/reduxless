#!/bin/bash

set -e

# Read the package version into an environment variable
PACKAGE_VERSION=$(npm info reduxless version)

BRANCH_NAME="release-${PACKAGE_VERSION}+"

# Make a version bump branch
printf "Create and push a version bump branch $BRANCH_NAME"
git checkout -b "${BRANCH_NAME}" > /dev/null 2>&1
npm version patch
git push origin "${BRANCH_NAME}" > /dev/null 2>&1
git push --tags

# Open a new GitHub window with a prefilled form
NEW_PR_URL="https://github.com/dhassaine/reduxless/compare/${BRANCH_NAME}?expand=1&title=Bump%20to%20${PACKAGE_VERSION}"
printf "Opening a pre-filled \"Create New PR\" form on GitHub, please submit your PR.\n\n"
printf "When your PR gets accepted, please run npm publish from the master branch.\n\n"
open $NEW_PR_URL

