#!/bin/bash
#Script to create a beta release.

# exit when any command fails
set -e

# print usage information
usage() {
  echo ""
  echo "Usage: $0 -b betaVersion"
  echo -e "  -b The beta version, format 'm.n.p-beta.b'"
  echo -e "  -s The step at which to start (optional, [1,4])"
  echo -e "Warning: the command needs to be run from the root of the repository."
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

# check option content
if [ -z "$betaVersion" ]
then
   error "Empty beta version";
   usage
fi

info "Creating beta release for '$betaVersion'..."

###################
if [ $step -eq 1 ]
then
  info "(1/4) update version number in files"

  a0="  \"version\": \"[0-9]+\.[0-9]+\.[0-9]+-(beta|rc)\.[0-9]+\","
  b0="  \"version\": \"${betaVersion}\","
  sed -i -r "s/${a0}/${b0}/g" package.json
  a1="  return '[0-9]+\.[0-9]+\.[0-9]+-(beta|rc)\.[0-9]+';"
  b1="  return '${betaVersion}';"
  sed -i -r "s/${a1}/${b1}/g" src/dicom/dicomParser.js
  a2="[0-9]+\.[0-9]+\.[0-9]+-(beta|rc)\.[0-9]+"
  b2="${betaVersion}"
  sed -i -r "s/${a2}/${b2}/g" resources/doc/jsdoc.conf.json


  ((step++))
fi

###################
if [ $step -eq 2 ]
then
  info "(2/4) create build"

  yarn run build

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
