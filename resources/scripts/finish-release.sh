#!/bin/bash
#Script to finish a release started with prep-release.

helpFunction()
{
  echo ""
  echo "Usage: $0 -r releaseVersion -n nextVersion"
  echo -e "  -r The release version, format 'm.n.p'"
  echo -e "  -n The next version, format 'm.n.p'"
  echo -e "Warning: the command needs to be run from the root of the repository."
  echo -e "Example:"
  echo -e "> finish-release -r 0.28.0 -n 0.29.0"
  echo ""
  exit 1 # Exit script after printing help
}

while getopts "r:p:h" opt
do
   case "$opt" in
      r ) releaseVersion="$OPTARG" ;;
      n ) nextVersion="$OPTARG" ;;
      h ) helpFunction ;;
      ? ) helpFunction ;; # Print helpFunction in case parameter is non-existent
   esac
done

# Print helpFunction in case parameters are empty
if [ -z "$releaseVersion" ] || [ -z "$nextVersion" ]
then
   echo "Some or all of the parameters are empty.";
   helpFunction
fi

echo "Finishing release for '$releaseVersion' with next version '$nextVersion'..."

###################

# 1. commit prepared changes
mnRelVersion="${releaseVersion%.*}"
git commit -a -m "Release v${mnRelVersion}"

###################

# 2 udpate master branch
git checkout master
# merge release into master
git merge --no-ff v$mnRelVersion
# push master
git push origin master

###################

# 3. update develop branch
git checkout develop
# merge release into develop
git merge --no-ff v$mnRelVersion
# update version number in files
a0="\"version\": \"${releaseVersion}\""
b0="\"version\": \"${nextVersion}-beta\""
sed -i -r "s/${a0}/${b0}/g" package.json
a1="return '${releaseVersion}';"
b1="return '${nextVersion}-beta';"
sed -i -r "s/${a1}/${b1}/g" src/dicom/dicomParser.js
# commit
git commit -a -m "Bumped version number to v${nextVersion}-beta"
# push develop
git push origin develop

###################

# 4. clean up
git branch -d v$mnRelVersion

###################

echo "Done finishing release."
