#!/bin/bash
#Script to finish a release started with prep-release.

# exit when any command fails
set -e

# print usage information
usage() {
  echo ""
  echo "Usage: $0 -r releaseVersion -n nextVersion"
  echo -e "  -r The release version, format 'm.n.p'"
  echo -e "  -n The next version, format 'm.n.p'"
  echo -e "  -s The step at which to start (optional, [1,4])"
  echo -e "Warning: the command needs to be run from the root of the repository."
  echo -e "Example:"
  echo -e "> finish-release -r 0.28.0 -n 0.29.0"
  echo ""
  exit 1 # Exit script after printing help
}

# messages
PREFIX="[fini]"
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
while getopts "r:n:s:h" opt
do
   case "$opt" in
      r ) releaseVersion="$OPTARG" ;;
      n ) nextVersion="$OPTARG" ;;
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
if [ -z "$nextVersion" ]
then
   error "Empty next version";
   usage
fi

info "Finishing release for '$releaseVersion' with next version '$nextVersion'..."

# branch name
releaseBranch="v${releaseVersion}"

###################
if [ $step -eq 1 ]
then
  info "(1/4) commit prepared changes"

  git commit -a -m "Release ${releaseBranch}"

  ((step++))
fi

###################
if [ $step -eq 2 ]
then
  info "2/4 udpate master branch"

  git checkout master
  # merge release into master
  git merge --no-ff $releaseBranch
  # push master
  git push origin master

  ((step++))
fi

###################
if [ $step -eq 3 ]
then
  info "3/4 update develop branch"

  git checkout develop
  # merge release into develop
  git merge --no-ff $releaseBranch
  # update version number in files
  a0="  \"version\": \"[0-9]+\.[0-9]+\.[0-9]+\","
  b0="  \"version\": \"${nextVersion}-beta.0\","
  sed -i -r "s/${a0}/${b0}/g" package.json
  a1="  return '[0-9]+\.[0-9]+\.[0-9]+';"
  b1="  return '${nextVersion}-beta.0';"
  sed -i -r "s/${a1}/${b1}/g" src/dicom/dicomParser.js
  a2="[0-9]+\.[0-9]+\.[0-9]+"
  b2="${nextVersion}-beta.0"
  sed -i -r "s/${a2}/${b2}/g" resources/doc/jsdoc.conf.json
  # commit
  git commit -a -m "Bumped version number to v${nextVersion}-beta.0"
  # push develop
  git push origin develop

  ((step++))
fi

###################
if [ $step -eq 4 ]
then
  info "4/4 clean up"

  git branch -d $releaseBranch

  ((step++))
fi

###################

info "Done finishing release!"
