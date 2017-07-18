# A S3 Image Uploader

A barebones Node.js app using [Express 4](http://expressjs.com/).



## Prerequisites

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku CLI](https://cli.heroku.com/) installed.
Make sure you have account on Heroku
An AWS S3 bucket has been created;
You have AWS authentication keys that have write access to the bucket.
You have enabled CORS (Cross-Origin Resource Sharing) on the bucket so that this application can store files in S3 and browser
does not have issues

```sh

<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <CORSRule>
        <AllowedOrigin>*</AllowedOrigin>
        <AllowedMethod>GET</AllowedMethod>
        <AllowedMethod>POST</AllowedMethod>
        <AllowedMethod>PUT</AllowedMethod>
        <AllowedHeader>*</AllowedHeader>
    </CORSRule>
</CORSConfiguration>

Also add this as Buket Policy for object access publicily

{
	"Version": "2008-10-17",
	"Statement": [
		{
			"Sid": "AllowPublicRead",
			"Effect": "Allow",
			"Principal": {
				"AWS": "*"
			},
			"Action": "s3:GetObject",
			"Resource": "arn:aws:s3:::S3_BUCKET/*"
		}
	]
}

```
## Running Locally


```sh
$ git clone git@github.com:ratewar/uploadimages.git # or clone your own fork
$ cd uploadimages
$ npm install
$ npm start
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

## Deploying to Heroku

```
$ heroku login
$ heroku create
$ git push heroku master
$ heroku ps:scale web=1
$ heroku config:set AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=yyy
$ heroku config:set S3_BUCKET=zzz
$ heroku open
```
or

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)
and go to setting tab and make sure you add environmet variables AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY and S3_BUCKET

## Working Heroku Application (to upload images)

https://marketplaceimages.herokuapp.com/