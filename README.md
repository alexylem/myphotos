# MyPhotos
Easily share photo albums without database

* [Screenshots](#screenshots)
* [Synopsis & Features](https://github.com/alexylem/myphotos/blob/master/README.md#synopsis--features)
* [Installation](https://github.com/alexylem/myphotos/blob/master/README.md#installation)
* [Report an issue](https://github.com/alexylem/myphotos/blob/master/README.md#report-an-issue)
* [Propose enhancement](https://github.com/alexylem/myphotos/blob/master/README.md#propose-enhancement)

## Screenshots

(soon)

## Synopsis & Features

MyPhotos is a simple tool which allows you to share photos without having to upload them on Internet.
Grant albums to group of people that can then securely connect to this web-app hosted @ your home.
It uses any directory-structured photo library stored in a drive, usb stick or a NAS.
It is optimized for low energy computers & bandwidth, and does not require any database.

### Photo Library

* Easily share photo albums without database
* MyPhotos reads files stored in a filesystem, works great with NAS
* Ability to change default Album covers and title
* Now supports videos that contain in their name a youtubeid between `()`
  * ex: `tom's first steps (1a2e3e4r5t6).avi`

### Sharing

* Share albums as public, restricted, or keep them private
* Restricted albums are shared to groups of people
* People authenticate using their Google account
* Hide bad/dupplicate photos instead of having to delete them

### Additional user features

* Multilanguage support (English, French) - easy to add yours
* Download photos in optimized or original sizes
* Use keyboard arrows to swipe photos
* Automatic updates

### Performance

* Generates thumbnails & optimized versions of your photos for faster display
* Leverage broswer cache on already viewed photos
* Preload next photo in the background

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
4. Login and click on Update Library

### Update your version of MyPhotos

1. Pull updates using `git pull --recurse-submodules`

## Report an issue

[Click here to report an issue](https://github.com/alexylem/myphotos/issues/new)

## Propose enhancement

[Click here to propose an enhancement](https://github.com/alexylem/myphotos/issues/new)
