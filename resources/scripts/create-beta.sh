#!/bin/bash
#Script to create a beta release.

# exit when any command fails
set -e

# print usage information
usage() {
  echo ""
  echo "Usage: $0 [-b betaVersion]"
  echo -e "  -b The beta version, format 'm.n.p-beta.b' (optional,"
  echo -e "     defaults to the package.json version with an incremented"
  echo -e "     beta number, or to it as is when starting after step 1)"
  echo -e "  -s The step at which to start (optional, [1,4])"
  echo -e "Example:"
  echo -e "> create-beta -b 0.28.0-beta.2"
  echo ""
  exit 1 # Exit script after printing help
}

# messages
PREFIX="[create]"
RESET_COLOR="\033[0m"
# print error message (red)
ERROR_COLOR="\033[1;91m"
error() {
  echo -e $ERROR_COLOR$PREFIX' '$1$RESET_COLOR
}
# print info message (blue)
INFO_COLOR="\033[1;94m"
info() {
  echo -e $INFO_COLOR$PREFIX' '$1$RESET_COLOR
}

# script step
step=1

# input options
while getopts "b:s:h" opt
do
   case "$opt" in
      b ) betaVersion="$OPTARG" ;;
      s ) step="$OPTARG" ;;
      h ) usage ;;
      ? ) usage ;; # Print usage in case parameter is non-existent
   esac
done

# run from the root of the repository
cd "$(git rev-parse --show-toplevel)"

# default version from package.json
if [ -z "$betaVersion" ]
then
  if [ $step -eq 1 ]
  then
    betaVersion=$(node resources/scripts/update-version.js pre --dry-run)
  else
    betaVersion=$(node resources/scripts/update-version.js current --dry-run)
  fi
fi

info "Creating beta release for '$betaVersion'..."

###################
if [ $step -eq 1 ]
then
  info "(1/4) update version number in files"

  node resources/scripts/update-version.js $betaVersion

  ((step++))
fi

###################
if [ $step -eq 2 ]
then
  info "(2/4) create build"

  rm -rf dist
  yarn run build-all

  ((step++))
fi

###################
if [ $step -eq 3 ]
then
  info "(3/4) commit changes"

  git commit -a -m "Beta v${betaVersion}"
  git push origin develop

  ((step++))
fi

###################
if [ $step -eq 4 ]
then
  info "(4/4) create tag"

  git tag v$betaVersion
  git push origin --tags

  ((step++))
fi

###################
info "Done creating beta! Publish it with 'npm publish --tag beta'"
