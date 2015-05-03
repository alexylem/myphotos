# MyPhotos
Easily share photo albums without database

* [Screenshots](#screenshots)
* [Synopsis & Features](#synopsis--features)
* [Installation](#installation)
* [Report an issue](#report-an-issue)
* [Propose enhancement](#propose-enhancement)

## Screenshots

*(soon)*

## Synopsis & Features

MyPhotos is a simple tool which allows you to share photos without having to upload them on Internet.
Grant albums to group of people that can then securely connect to this web-app hosted @ your home.
It uses any directory-structured photo library stored in a drive, usb stick or a NAS.
It is optimized for low energy computers & bandwidth, and does not require any database.

### Photo Library

- [X] Easily share photo albums without database
- [X] MyPhotos reads files stored in a filesystem, works great with NAS
- [X] Ability to change default Album covers and title
- [X] Now supports videos that contain in their name a youtubeid between `()`
  * ex: `tom's first steps (1a2e3e4r5t6).avi`

### Sharing

- [X] Share albums as public, restricted, or keep them private
- [X] Restricted albums are shared to groups of people
- [X] People authenticate using their Google account
- [X] Hide bad/dupplicate photos instead of having to delete them

### Additional user features

- [X] Multilanguage support (English, French) - easy to add yours
- [X] Download photos in optimized or original sizes
- [X] Use keyboard arrows to swipe photos
- [X] Automatic updates

### Performance

- [X] Generates thumbnails & optimized versions of your photos for faster display
- [X] Leverage broswer cache on already viewed photos
- [X] Preload next photo in the background

### Upcoming features

- [ ] Let users download entire albums

## Installation

### Pre-requisites

* WebServer with PHP - no need for mysql :)
  * [MAMP](http://www.mamp.info) for Mac
  * [NGINX](http://www.raspipress.com/2014/06/tutorial-install-nginx-and-php-on-raspbian/) for Raspberry Pi
* git installed `sudo apt-get install git`
* [Create Google API project](http://support.wpsocial.com/support/articles/144223-creating-a-google-project-with-the-google-api-console) for Public & Secret keys

### Installation steps

1. Clone the repo `git clone --recursive https://github.com/alexylem/myphotos.git`
2. Create `config.php` from a copy of `config.default.php`
3. Fill-in `config.php` with your settings & Google API Key
4. Login and click on *Update Library*

### Update your version of MyPhotos

1. Login and click on *Check updates*

## Report an issue

[Click here to report an issue](https://github.com/alexylem/myphotos/issues/new)

## Propose enhancement

[Click here to propose an enhancement](https://github.com/alexylem/myphotos/issues/new)
