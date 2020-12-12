#!/bin/bash
#Script to push build results on the repository gh-pages branch.

# we should be in /home/travis/build/ivmartel/dwv
echo -e "Starting to update gh-pages...\n"

# create doc (result in ./build/doc)
yarn run doc

# go to home and setup git
cd $HOME
git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis"
# using token, clone gh-pages branch
git clone --quiet --branch=gh-pages https://${GH_TOKEN}@github.com/ivmartel/dwv.git gh-pages
# clean up
rm -Rf $HOME/gh-pages/doc/stable/*
# copy doc
cp -Rf $HOME/build/ivmartel/dwv/build/doc $HOME/gh-pages/doc/stable
# move to root of repo
cd $HOME/gh-pages
# add, commit and push files
git add -Af .
git commit -m "Travis build $TRAVIS_BUILD_NUMBER pushed to gh-pages"
git push -fq origin gh-pages

echo -e "Done updating gh-pages.\n"
