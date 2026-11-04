#!/bin/bash
#Script to prepare a release (finish it with finish-release).

# exit when any command fails
set -e

# print usage information
usage() {
  echo ""
  echo "Usage: $0 -r releaseVersion"
  echo -e "  -r The release version, format 'm.n.p'"
  echo -e "  -s The step at which to start (optional, [1,5])"
  echo -e "Warning: the command needs to be run from the root of the repository."
  echo -e "Example:"
  echo -e "> prep-release -r 0.28.0"
  echo ""
  exit 1 # Exit script after printing help
}

# messages
PREFIX="[prep]"
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
while getopts "r:s:h" opt
do
   case "$opt" in
      r ) releaseVersion="$OPTARG" ;;
      s ) step="$OPTARG" ;;
      h ) usage ;;
      ? ) usage ;; # Print usage in case parameter is non-existent
   esac
done

# check option content
if [ -z "$releaseVersion" ]
then
   error "Empty release version";
   usage
fi

info "Preparing release for '$releaseVersion'..."

# branch name
releaseBranch="v${releaseVersion}"

###################
if [ $step -eq 1 ]
then
  info "(1/5) create release branch"

  git checkout develop
  git pull
  git checkout -b $releaseBranch

  ((step++))
fi

###################
if [ $step -eq 2 ]
then
  info "(2/5) update version number in files"

  a0="  \"version\": \"[0-9]+\.[0-9]+\.[0-9]+-(beta|rc)\.[0-9]+\","
  b0="  \"version\": \"${releaseVersion}\","
  sed -i -r "s/${a0}/${b0}/g" package.json
  a1="  return '[0-9]+\.[0-9]+\.[0-9]+-(beta|rc)\.[0-9]+';"
  b1="  return '${releaseVersion}';"
  sed -i -r "s/${a1}/${b1}/g" src/dicom/dicomParser.js
  a2="[0-9]+\.[0-9]+\.[0-9]+-(beta|rc)\.[0-9]+"
  b2="${releaseVersion}"
  sed -i -r "s/${a2}/${b2}/g" resources/doc/jsdoc.conf.json

  ((step++))
fi

###################
if [ $step -eq 3 ]
then
  info "(3/5) create build"

  rm -r dist
  yarn run build-all

  ((step++))
fi

###################
if [ $step -eq 4 ]
then
  info "(4/5) update changelog"

  # new: release milestone issues
  node resources/scripts/changelog.js $releaseVersion > new.md
  # line: separator between releases
  echo -en '\n---\n' > line.md
  # old: changelog with no title
  tail -n +2 changelog.md > old.md
  # concat new + line + old
  cat new.md line.md old.md > changelog.md
  # clean up
  rm new.md
  rm line.md
  rm old.md

  ((step++))
fi

###################
if [ $step -eq 5 ]
then
  info "(5/5) update test results"

  # run tests
  yarn run test-ci
  # convert json to md
  node ../jsonqa2md/jsonqa2md

  ((step++))
fi

###################
info "Done preparing release!"
