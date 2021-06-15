#!/bin/bash
#Script to prepare a release (finish it with finish-release).

# exit when any command fails
set -e

# print usage information
usage() {
  echo ""
  echo "Usage: $0 -r releaseVersion -p previousVersion"
  echo -e "  -r The release version, format 'm.n.p'"
  echo -e "  -p The previous version for issue gathering in changelog, format 'm.n.p'"
  echo -e "  -s The step at which to start (optional, [1,4])"
  echo -e "Warning: the command needs to be run from the root of the repository."
  echo -e "Example:"
  echo -e "> prep-release -r 0.28.0 -p 0.27.0"
  echo ""
  exit 1 # Exit script after printing help
}
# print error message (red)
error() {
  echo -e "\033[31;31m[prep] $1\033[0m"
}
# print info message (blue)
info() {
  echo -e "\033[34;34m[prep] $1\033[0m"
}

# script step
step=1

# input options
while getopts "r:p:s:h" opt
do
   case "$opt" in
      r ) releaseVersion="$OPTARG" ;;
      p ) prevVersion="$OPTARG" ;;
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
if [ -z "$prevVersion" ]
then
   error "Empty previous version";
   usage
fi

info "Preparing release for '$releaseVersion' with previous version '$prevVersion'..."

# branch name
releaseBranch="v${releaseVersion}"

###################
if [ $step -eq 1 ]
then
  info "(1/4) create release branch"

  git checkout develop
  git pull
  git checkout -b $releaseBranch
  
  ((step++))
fi

###################
if [ $step -eq 2 ]
then
  info "(2/4) update version number in files"

  a0="  \"version\": \"[0-9]+\.[0-9]+\.[0-9]+-beta\","
  b0="  \"version\": \"${releaseVersion}\","
  sed -i -r "s/${a0}/${b0}/g" package.json
  a1="  return '[0-9]+\.[0-9]+\.[0-9]+-beta';"
  b1="  return '${releaseVersion}';"
  sed -i -r "s/${a1}/${b1}/g" src/dicom/dicomParser.js
  
  ((step++))
fi

###################
if [ $step -eq 3 ]
then
  info "(3/4) create build"

  yarn run build
  # copy build to dist
  cp build/dist/*.js dist
  
  ((step++))
fi

###################
if [ $step -eq 4 ]
then
  info "(4/4) update changelog"

  # gren wants an existing tag...
  git tag v$releaseVersion
  git push origin --tags
  # run gren
  yarn run gren changelog --generate --override --changelog-filename=new.md \
    --tags=v$prevVersion..v$releaseVersion --milestone-match=$releaseVersion 
  # delete tag
  git tag -d v$releaseVersion
  git push --delete origin v$releaseVersion
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
info "Done preparing release!"
