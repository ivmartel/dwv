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
  echo -e "\033[31;31m[create] $1\033[0m"
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

# change path to node_modules
a3="src=\"..\/..\/node_modules\/"
b3="src=\".\/node_modules\/"
sed -i "s/${a3}/${b3}/g" $fileName
