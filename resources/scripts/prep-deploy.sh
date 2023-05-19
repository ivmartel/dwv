#!/bin/bash
#Script to prepare the test viewer for deploy

# exit when any command fails
set -e

# print usage information
usage() {
  echo ""
  echo "Usage: $0 -f fileName"
  echo -e "  -f the file to prepare for deploy"
  echo -e "Example:"
  echo -e "> prep-deploy -f build/viewer.html"
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

# input options
while getopts "f:h" opt
do
   case "$opt" in
      f ) fileName="$OPTARG" ;;
      h ) usage ;;
      ? ) usage ;; # Print usage in case parameter is non-existent
   esac
done

# check option content
if [ -z "$fileName" ]
then
   error "Empty file name";
   usage
fi

info "Preparing deploy for '$fileName'"

if [ "$(grep -c "<!-- dwv build -->" $fileName)" -eq 1 ]
then
  info "Switching dwv source to dwv build"
  # end source comment, remove start build comment
  a1="\(<!-- dwv build -->\)\(<!--\)"
  b1="\1"
  sed -i "s/${a1}/${b1}/g" $fileName
  # remove end build comment
  a2="\(-->\)\(<!-- local -->\)"
  b2="\2"
  sed -i "s/${a2}/${b2}/g" $fileName
fi

if [ "$(grep -c "'../../decoders/" $fileName)" -eq 4 ]
then
  info "Move to local decoders"
  # change path to decoders
  a4="'..\/..\/decoders\/"
  b4="'.\/decoders\/"
  sed -i "s/${a4}/${b4}/g" $fileName
fi