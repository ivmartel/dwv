This page lists recommendations for getting the code, developing and debugging dwv.

## Version control system
Not much choice on this one, [Git](https://git-scm.com/) is, these days, the de-facto version control system. Git comes with most Linux distributions. For Windows see: [git-scm.com/downloads](https://git-scm.com/downloads). To remember the commands, I like this [cheatsheet](http://ndpsoftware.com/git-cheatsheet.html#loc=workspace;)

Github provides some help on [[working-with-key-passphrases|http://help.github.com/working-with-key-passphrases/]]. Github uses the Open-ssh2 format. These keys can be generated using the `ssh-keygen` command. On windows, if you have installed Git, you should have a `Git-bash` from which you can run the command. The full command is: `ssh-keygen -t rsa -C "tekkub@gmail.com"`. You can then paste the public part in your Github account settings. The EGit extension of Eclipse also allows you to create a key.

If you are using [Tortoise-git](http://code.google.com/p/tortoisegit/), you need to convert your Open-ssh2 key to the putty key format. You can do this using the `PuttyGen` software by opening your Open-ssh2 key and then saving it. Then load the putty key in the `Pageant` application and you are ready to pull code with tortoise!


## Implementation

A text editor can be enough to play with javascript, I use [Atom](https://atom.io/) with the following extra packages: [linter-jshint](https://atom.io/packages/linter-jshint) (based on [linter](https://atom.io/packages/linter)) and [minimap](https://atom.io/packages/minimap).

You can't go very far these days without a local http server, for example to allow loading local DICOM files. I use 
node's [http-server](https://www.npmjs.com/package/http-server) but they are many, see the list on the [How-to-run-things-locally](https://threejs.org/docs/#manual/introduction/How-to-run-thing-locally) page of the three.js wiki.

## Debugging

Browsers do provide very extensive debugging tools:

 * Chrome: {Settings Icon} > Tools > Developer tools (or `Ctrl + Shift + i`)
 * Firefox: {Firefox} > Web Developer > Inspector (or `Ctrl + Shift + i`, k for the Web Console)

Chrome allows to simulate touch events: in the `Developer tools` window, popup the `Drawer` from its button (top right) or press `Esc` and tick `Emulate touch screen` from its `Emulation` tab. Beware that this changes the way Chrome fires events, for example it stops sending `mousemove` events...

For the application behaviour, check these docs:
 * Firefox OS App Manager: [quick start](https://marketplace.firefox.com/developers/docs/quick_start), [Using the App Manager](https://developer.mozilla.org/en-US/Firefox_OS/Using_the_App_Manager)
 * Chrome application: [building your first app](http://developer.chrome.com/apps/first_app.html)
 * Debugging Firefox for android: [remote](https://developer.mozilla.org/en-US/docs/Tools/Remote_Debugging/Firefox_for_Android) or [local](https://wiki.mozilla.org/Mobile/Fennec/Android/Emulator)
 * Check speed with Google [tools](https://developers.google.com/speed/)

Regarding application cache:
 * [manifesto](http://manifesto.ericdelabar.com/) to check that all resources of the cache are present
 * `chrome://appcache-internals` to check what has been cached

## Release tasks
 1. Fix all current [issues](https://github.com/ivmartel/dwv/issues)
 1. Check that help information is in sync
 1. Check the [build status](https://travis-ci.org/ivmartel/dwv)
 1. Check [User stories](https://github.com/ivmartel/dwv/wiki/User-stories) visually on one test data (babymri for example)
 1. Check [DICOM support](https://github.com/ivmartel/dwv/wiki/DICOM-support) by loading the test [data](https://github.com/ivmartel/dwv/tree/master/data)
 1. Check [PACS support](https://github.com/ivmartel/dwv/wiki/PACS-support) by launching dwv in PACS software
 1. Check [Platform support](https://github.com/ivmartel/dwv/wiki/Platform-support) by launching dwv on different machine/browsers...
 1. Check module integration
 1. Check fiddles (links on the [[API]] wiki page)
 1. Update translations
 1. Create release (follows git flow [release-branches](https://nvie.com/posts/a-successful-git-branching-model/#release-branches))
    1. Create the release branch: `git checkout -b v1.2 develop`
    1. Update version numbers: [dicomParser.js](https://github.com/ivmartel/dwv/blob/master/src/dicom/dicomParser.js),
    [package.json](https://github.com/ivmartel/dwv/blob/master/package.json)
    1. Create release: `yarn run build`
    1. Copy release into the `dist` folder
    1. Commit: `git commit -a -m "Bumped version number to v1.2"`
    1. Checkout master: `git checkout master`
    1. Merge release into master: `git merge --no-ff v1.2`
    1. Push master: `git push origin master`
    1. Integrate changes in develop: `git checkout develop` and `git merge --no-ff v1.2`
    1. Update version numbers to beta
    1. Commit: `git commit -a -m "Bumped version number to v1.3-beta"`
    1. Push: `git push origin develop`
    1. Delete release branch: `git branch -d v1.2`
 1. Create release from [github releases](https://github.com/ivmartel/dwv/releases) (creates the tag)
 1. Publish npm package: `npm publish` in the main directory on the `master` branch
 1. Create [[Snapshots]]
 1. Add a post to the [[Blog]]
 1. Update dependent plugins: wordpress [dicom-support](https://wordpress.org/plugins/dicom-support/), [dwv-orthanc-plugin](https://github.com/ivmartel/dwv-orthanc-plugin), [dwv-dcm4chee-web](https://github.com/ivmartel/dwv-dcm4chee-web)

***

## Eclipse (previous recommendation)

I used to recommend using Eclipse to develop dwv but it started to get a bit slow (not sure if it is due to bad settings) and therefore I switched to using a text editor (see above).

Eclipse has plugins for javascript development (in the WebTools) that ease the code writing. Git, the version control used for dwv, is directly integrated in the IDE either by default or via a plugin (EGit). Eclipse project settings are available from the source root folder. 

These tips were made for Eclipse Mars (4.5, 06/2015), Luna (4.4, 06/2014) and Kepler (4.3, 06/2013).

### Set up
* Download Eclipse IDE for Java Developers from [[http://www.eclipse.org/downloads/]],
* In the `Help > Install New Software...`, `Work with` the first official Eclipse repository
* From the `Web, XML, JavaEE and OSGi Entreprise Development` section, check and install the `JavaScript Development Tools` (optionally add the `Eclipse Web Developer Tools` for editing html),
* JSHint: in Eclipse Mars, install it from the Eclipse Marketplace (in Help) or:
 * In the `Help > Install New Software...`, `Work with` [[http://github.eclipsesource.com/jshint-eclipse/updates/]]
 * Check and install the [JSHint](http://www.jshint.com/) [eclipse plugin](http://github.eclipsesource.com/jshint-eclipse/). Error messages are explained at [[http://jslinterrors.com/]].

### Download the code
* First set up your SSH settings by adding your signature file in the preferences (search for SSH2),
* Modify the Git `Default Repository folder` in the preferences (search for Git) to point to the folder where you want to do the checkout,
* Under the git view, click on the `Clone a Git Repository and add the clone to this view`,
* Paste the url given on the github front page for the ssh protocol, select the `ssh` protocol and click `Next`,
* Choose a branch and click `Next`,
* Verify the settings and click `Finish`.

You should now see the dwv tree in the list of repositories. Under the root source folder, you will find a `eclipse.epf` file that you can import. These settings allows to edit files all in the same way (spaces instead of tabs for example).

### Set up the javascript project
* You can now right click on the `Working directory` and choose `Import Projects`,
* Choose the `Import Existing Projects` and click `Next`,
* Select dwv and click `Finish`.

If you go to the Javascript view, you should now see the dwv project.

### Settings
To avoid getting errors from the external projects:

 * In the project properties, under `JavaScript > Include Path` tab `Source`, add `ext/` as an excluded path
 * For JSHint:
  * allow it for all `.js` files in all folders (resolves to `//*.js`)
  * exclude all `.js` files in the `ext` folder (resolves to `ext//*.js`)

### Branching
In eclipse, switch to the git view. Right click on `Branches > Local`, choose `Switch To > New Branch` and create a new local branch selecting `Merge` as a `Pull Strategy`. You can then push the branch to the main repository. You are now set to develop on your new branch. When ready, the simplest is to merge from the github website via a pull request. 

### Other
You can view html in Eclipse by double clicking on the `index.html` file or right click and then choose `Open With` then `Web Editor`