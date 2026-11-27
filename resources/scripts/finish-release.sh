#!/bin/bash
#Script to finish a release started with prep-release.

# exit when any command fails
set -e

# print usage information
usage() {
  echo ""
  echo "Usage: $0 [-r releaseVersion] [-n nextVersion]"
  echo -e "  -r The release version, format 'm.n.p' (optional when starting"
  echo -e "     at step 1, defaults to the release branch package.json version)"
  echo -e "  -n The next version, format 'm.n.p' (optional, defaults"
  echo -e "     to the release version with an incremented minor)"
  echo -e "  -s The step at which to start (optional, [1,4])"
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

# run from the root of the repository
cd "$(git rev-parse --show-toplevel)"

# default versions
if [ -z "$releaseVersion" ]
then
  if [ "$step" != "1" ]
  then
    error "The release version is required when not starting at step 1";
    usage
  fi
  # from package.json, run from the release branch
  releaseVersion=$(node resources/scripts/update-version.js current --dry-run)
fi
if [ -z "$nextVersion" ] && [[ "$releaseVersion" =~ ^[0-9]+\.([0-9]+)\. ]]
then
  # increment minor
  nextVersion="${releaseVersion%%.*}.$((BASH_REMATCH[1] + 1)).0"
fi

# check option content
versionRegex="^[0-9]+\.[0-9]+\.[0-9]+$"
if [[ ! "$releaseVersion" =~ $versionRegex ]]
then
   error "Bad release version format: '$releaseVersion'";
   usage
fi
if [[ ! "$nextVersion" =~ $versionRegex ]]
then
   error "Bad next version format: '$nextVersion'";
   usage
fi
if [[ ! "$step" =~ ^[1-4]$ ]]
then
   error "Bad step: '$step'";
   usage
fi

info "Finishing release for '$releaseVersion' with next version '$nextVersion'..."

# branch name
releaseBranch="v${releaseVersion}"

###################
if [ $step -eq 1 ]
then
  info "(1/4) commit prepared changes"

  # check the current branch is the release one
  currentBranch=$(git branch --show-current)
  if [ "$currentBranch" != "$releaseBranch" ]
  then
    error "Not on the release branch '$releaseBranch' but on '$currentBranch'"
    exit 1
  fi
  git commit -a -m "Release ${releaseBranch}"

  ((step++))
fi

###################
if [ $step -eq 2 ]
then
  info "(2/4) update master branch"

  git checkout master
  git pull
  # merge release into master
  git merge --no-ff $releaseBranch
  # push master
  git push origin master

  ((step++))
fi

###################
if [ $step -eq 3 ]
then
  info "(3/4) update develop branch"

  git checkout develop
  git pull
  # merge release into develop
  git merge --no-ff $releaseBranch
  # update version number in files
  node resources/scripts/update-version.js ${nextVersion}-beta.0
  # commit
  git commit -a -m "Bumped version number to v${nextVersion}-beta.0"
  # push develop
  git push origin develop

  ((step++))
fi

###################
if [ $step -eq 4 ]
then
  info "(4/4) clean up"

  git branch -d $releaseBranch

  ((step++))
fi

###################

info "Done finishing release!"
