#!/bin/bash

set -e

# Make a version bump branch
NEW_VERSION=$(npm version patch --no-git-tag-version)
BRANCH_NAME="release-${NEW_VERSION}"
printf "Create and push a version bump branch $BRANCH_NAME"
git checkout -b "${BRANCH_NAME}"
git add package.json
git commit -m "bumping to version ${NEW_VERSION}"
git push origin "${BRANCH_NAME}"
git tag ${NEW_VERSION}
git push origin ${NEW_VERSION}

# Open a new GitHub window with a prefilled form
NEW_PR_URL="https://github.com/dhassaine/reduxless/compare/${BRANCH_NAME}?expand=1&title=Bump%20to%20${NEW_VERSION}"
printf "Opening a pre-filled \"Create New PR\" form on GitHub, please submit your PR.\n\n"
printf "When your PR gets accepted, please run npm publish from the master branch.\n\n"
open $NEW_PR_URL

git checkout master
git branch -D "${BRANCH_NAME}"

