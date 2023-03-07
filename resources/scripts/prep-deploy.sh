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
# print error message (red)
error() {
  echo -e "\033[1;31m[create] $1\033[0m"
}
# print info message (blue)
info() {
  echo -e "\033[1;34m[prep] $1\033[0m"
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

if [ "$(grep -c "<!-- dwv sources -->" $fileName)" -eq 1 ]
then
  info "Switching dwv source to dwv build"
  # start source comment
  a0="\(<!-- dwv sources -->\)"
  b0="\1<!--"
  sed -i "s/${a0}/${b0}/g" $fileName
  # end source comment, remove start build comment
  a1="\(<!-- dwv build -->\)\(<!--\)"
  b1="-->\1"
  sed -i "s/${a1}/${b1}/g" $fileName
  # remove end build comment
  a2="\(-->\)\(<!-- local -->\)"
  b2="\2"
  sed -i "s/${a2}/${b2}/g" $fileName
fi

if [ "$(grep -c "../../node_modules" $fileName)" -eq 2 ]
then
  info "Move to local node_modules"
  # change path to node_modules
  a3="src=\"..\/..\/node_modules\/"
  b3="src=\".\/node_modules\/"
  sed -i "s/${a3}/${b3}/g" $fileName
fi

if [ "$(grep -c ": '../../decoders" $fileName)" -eq 4 ]
then
  info "Move to local decoders"
  # change path to decoders
  a4=": '..\/..\/decoders\/"
  b4=": '.\/decoders\/"
  sed -i "s/${a4}/${b4}/g" $fileName
fi