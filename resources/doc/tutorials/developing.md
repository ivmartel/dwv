This page lists recommendations for getting the code, developing and debugging dwv.

## Version control system
Not much choice on this one, [Git](https://git-scm.com/) is, these days, the de-facto version control system. Git comes with most Linux distributions. For Windows see: [git-scm.com/downloads](https://git-scm.com/downloads). To remember the commands, I like this [cheatsheet](http://ndpsoftware.com/git-cheatsheet.html#loc=workspace;)

Github provides some help on [[working-with-key-passphrases|http://help.github.com/working-with-key-passphrases/]]. Github uses the Open-ssh2 format. These keys can be generated using the `ssh-keygen` command. On windows, if you have installed Git, you should have a `Git-bash` from which you can run the command. The full command is: `ssh-keygen -t rsa -C "tekkub@gmail.com"`. You can then paste the public part in your Github account settings. The EGit extension of Eclipse also allows you to create a key.

If you are using [Tortoise-git](http://code.google.com/p/tortoisegit/), you need to convert your Open-ssh2 key to the putty key format. You can do this using the `PuttyGen` software by opening your Open-ssh2 key and then saving it. Then load the putty key in the `Pageant` application and you are ready to pull code with tortoise!


## Implementation

A text editor can be enough to play with javascript, I use [Atom](https://atom.io/) with the following extra packages: [linter-eslint](https://atom.io/packages/linter-eslint) (based on [linter](https://atom.io/packages/linter)) and [minimap](https://atom.io/packages/minimap).


## Debugging

Browsers do provide very extensive debugging tools:

 * Chrome: {Settings Icon} > Tools > Developer tools (or `F12`)
 * Firefox: {Firefox} > Web Developer > Inspector (or `F12`)

Chrome allows to simulate touch events: in the `Developer tools` window, popup the `Drawer` from its button (top right) or press `Esc` and tick `Emulate touch screen` from its `Emulation` tab. Beware that this changes the way Chrome fires events, for example it stops sending `mousemove` events...

For the application behaviour, check these tools:
 * Google [lighthouse](https://developers.google.com/web/tools/lighthouse)
 * [Using service workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers) from mozilla

## Release tasks
 1. Fix all current [issues](https://github.com/ivmartel/dwv/issues)
 1. Check that help information is in sync
 1. Check the [build status](https://github.com/ivmartel/dwv/actions)
 1. Check DICOM [conformance](./tutorial-conformance.html) by loading the test [data](https://github.com/ivmartel/dwv/tree/master/data)
 1. Check [integrations](./tutorial-integrations.html) by launching dwv in some PACS
 1. Check module integration
 1. Update translations
 1. Create release:
    1. run the `resources/scripts/prep-release` script with the release and previous version
    1. review changes
    1. run the `resources/scripts/finish-release` script with the release and next version
 1. Check fiddles (links on the [examples](./tutorial-examples.html) wiki page)
 1. Create release from [github releases](https://github.com/ivmartel/dwv/releases) (creates the tag)
 1. Create the doc for the release `yarn run doc` and push it on the `gh-pages` branch
 1. Publish npm package: `npm publish` in the main directory on the `master` branch
 1. Create snapshots
 1. Update dependent plugins: wordpress [dicom-support](https://wordpress.org/plugins/dicom-support/), [dwv-orthanc-plugin](https://github.com/ivmartel/dwv-orthanc-plugin), [dwv-dcm4chee-web](https://github.com/ivmartel/dwv-dcm4chee-web)
