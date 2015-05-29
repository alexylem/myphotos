# MyPhotos
Easily share photo albums without database

* [Screenshots](#screenshots)
* [Synopsis & Features](#synopsis--features)
* [Installation](#installation)
* [Report an issue](#report-an-issue)
* [Propose enhancement](#propose-enhancement)

## Screenshots

See [Screenshots](https://github.com/alexylem/myphotos/tree/master/screenshots) folder.

## Synopsis & Features

MyPhotos is a simple tool which allows you to share photos without having to upload them on Internet.
Grant albums to group of people that can then securely connect to this web-app hosted @ your home.
It uses any directory-structured photo library stored in a drive, usb stick or a NAS.
It is optimized for low energy computers & bandwidth, and does not require any database.

### :camera: Photo Library

- [X] Easily share photo albums without database
- [X] MyPhotos reads files stored in a filesystem, works great with NAS
- [X] Ability to change default Album covers and title
- [X] Supports videos and youtube videos that contain in their name a youtubeid between `()`
  * ex: `tom's first steps (1a2e3e4r5t6).avi` <-- youtube id is *1a2e3e4r5t6*

### :busts_in_silhouette: Admin features & sharing

- [X] Share albums as public, restricted, or keep them private
- [X] Restricted albums are shared to groups of people
- [X] People authenticate using their Google account
- [X] Send email notification about shared albums
- [X] Hide bad/dupplicate photos instead of having to delete them
- [X] Auto/Manual check of updates and upgrade in 1 click

### :+1: Additional user features

- [X] Web-app for smartphones and tablets
- [X] Multilanguage support (:uk: English, :fr: French) - easy to add yours
- [X] Search albums
- [X] Use keyboard to browse albums
- [X] Download photos or full albums in optimized and original sizes

### :fast_forward: Performance

- [X] Generates thumbnails & optimized versions of your photos for faster display
- [X] Leverage browser cache on already viewed photos
- [X] Preload next photo in the background

### :clock10: Upcoming features

See the [todo](todo.md) list

## Installation

### :ballot_box_with_check: Pre-requisites

* WebServer with PHP - no need for mysql :)
  * [MAMP](http://www.mamp.info) for Mac
  * [NGINX](http://www.raspipress.com/2014/06/tutorial-install-nginx-and-php-on-raspbian/) for Raspberry Pi
* (*optional*) git installed (for automatic updates)
```
sudo apt-get install git
```
* [Create Google API project](http://support.wpsocial.com/support/articles/144223-creating-a-google-project-with-the-google-api-console) for Public & Secret keys
* (*optional*) [Create Google Analytics Client Id](http://www.google.com/analytics/) for tracking the traffic on MyPhotos

### :mans_shoe: Installation steps

* Clone (or [download](https://github.com/alexylem/myphotos/archive/master.zip) & extract) the repo on a web directory:
```
cd /var/www/myphotos
git clone --recursive https://github.com/alexylem/myphotos.git
```
* Change owner of myphotos files for web configuration & update:
```
sudo chown -R www-data:www-data .
```
* Navigate to MyPhotos and set-up your settings
* Click on admin menu -> *Synchronize*

### Update your version of MyPhotos

* Login and click on *Check updates*
* Automatic check of updates can be enabled in *Settings* / *Security*

## Report an issue

[Click here to report an issue](https://github.com/alexylem/myphotos/issues/new)

## Propose enhancement

[Click here to propose an enhancement](https://github.com/alexylem/myphotos/issues/new)
