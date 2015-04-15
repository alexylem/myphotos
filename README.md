# MyPhotos
Easily share photo albums without database

* [Synopsis & Features](https://github.com/alexylem/myphotos/blob/master/README.md#synopsis--features)
* [Installation](https://github.com/alexylem/myphotos/blob/master/README.md#installation)
* [Report an issue](https://github.com/alexylem/myphotos/blob/master/README.md#report-an-issue)
* [Propose enhancement](https://github.com/alexylem/myphotos/blob/master/README.md#propose-enhancement)

## Synopsis & Features

MyPhotos is a simple tool which allows you to share photos without having to upload them on Internet.
Grant albums to group of people that can then securely connect to this web-app hosted @ your home.
It uses any directory-structured photo library stored in a drive, usb stick or a NAS.
It is optimized for low energy computers & bandwidth, and does not require any database.

### Photo Library

* Easily share photo albums without database
* MyPhotos reads files stored in a filesystem, works great with NAS
* Generates thbumnails & optimized versions of your photos for faster display
* Ability to change default Album covers

### Sharing

* Share albums as public, restricted, or keep them private
* Restricted albums are shared to groups of people
* People can be added from their email address (Gmail only)

### Additional user features

* (soon) Download photos or entire Album structures
* Use keyboard arrows to swipe photos

## Installation

### Pre-requisites

* WebServer with PHP (ex: [MAMP](http://www.mamp.info) for Mac) no need for mysql :)
* [Create Google API project](http://support.wpsocial.com/support/articles/144223-creating-a-google-project-with-the-google-api-console) for Public & Secret keys

### Installation steps

1. Clone the repo `git clone --recursive https://github.com/alexylem/myphotos.git`
2. Create `config.php` from a copy of `config.default.php`
3. Fill-in `config.php` with your settings & Google API Key
4. Visit `cron.php` to generate thumbnails

## Report an issue

[Click here to report an issue](https://github.com/alexylem/myphotos/issues/new)

## Propose enhancement

[Click here to propose an enhancement](https://github.com/alexylem/myphotos/issues/new)
