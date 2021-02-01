#!/bin/bash
#Script to prepare a release (finish it with finish-release).

helpFunction()
{
  echo ""
  echo "Usage: $0 -r releaseVersion -p previousVersion"
  echo -e "  -r The release version, format 'm.n.p'"
  echo -e "  -p The previous version for issue gathering in changelog, format 'm.n.p'"
  echo -e "Warning: the command needs to be run from the root of the repository."
  echo -e "Example:"
  echo -e "> prep-release -r 0.28.0 -p 0.27.0"
  echo ""
  exit 1 # Exit script after printing help
}

while getopts "r:p:h" opt
do
   case "$opt" in
      r ) releaseVersion="$OPTARG" ;;
      p ) prevVersion="$OPTARG" ;;
      h ) helpFunction ;;
      ? ) helpFunction ;; # Print helpFunction in case parameter is non-existent
   esac
done

# Print helpFunction in case parameters are empty
if [ -z "$releaseVersion" ] || [ -z "$prevVersion" ]
then
   echo "Some or all of the parameters are empty.";
   helpFunction
fi

echo "Preparing release for '$releaseVersion' with previous version '$prevVersion'..."

###################

# 1. create release branch
mnRelVersion="${releaseVersion%.*}"
git checkout -b v$mnRelVersion

###################

# 2. update version number in files
a0="\"version\": \"${releaseVersion}-beta\""
b0="\"version\": \"${releaseVersion}\""
sed -i -r "s/${a0}/${b0}/g" package.json
a1="return '${releaseVersion}-beta';"
b1="return '${releaseVersion}';"
sed -i -r "s/${a1}/${b1}/g" src/dicom/dicomParser.js

###################

# 3. create build
yarn run build
# copy build to dist
cp build/dist/*.js dist

###################

# 4. update changelog
yarn run gren changelog --generate --override --changelog-filename=new.md \
  --tags=v$prevVersion..v$releaseVersion --milestone-match=$releaseVersion 
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

###################

echo "Done preparing release."
