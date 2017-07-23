## AWS ChatBot Powered By Lex
This bot is built as part of [AWS Hackathon](https://awschatbot2017.devpost.com). For more details please refer the link.

Use Case: A Markeplace to sell second hand items in this case this bot helps you sell your second hand car. Powered by AWS Lambda and Lex.


## Pre-requisites

1. Node.js `v4.3.0` or later. [Download](https://nodejs.org/en/download/)
2. Serverless CLI `v1.9.0` or later. You can run `npm install -g serverless` to install it once node is installed
3. An AWS account. If you don't already have one, you can sign up for a [free trial](https://aws.amazon.com/s/dm/optimization/server-side-test/free-tier/free_np/) that includes 1 million free Lambda requests per month.
4. **Set-up your Credentials**[AWS Docs](http://docs.aws.amazon.com/cli/latest/userguide/installing.html).
[Watch the video on setting up credentials Serverless](https://www.youtube.com/watch?v=HSd9uYj2LJA)

## How to Setup Project

```bash
# Install node modules
# Change into the newly created directory
$ cd projectdir
$ npm install
$ sls deploy
```
## To Install Market Place Apps which includes Chatbot and Slack Dealer Market Place app use below link

1. [Market Place Apps](http://marketplaceapps.s3-website-us-east-1.amazonaws.com)

2. Working Chatbot is installed on Slack on [Car Seller](https://techunleashed.slack.com/)

3. Working Dealer Market Place Slack apps is installed on [MarketPlace-1](https://carsmktplace.slack.com/) and [MarketPlace-2](https://carmarketplace-2.slack.com/)

4. To have access to Chatbot and Dealer Market place please send an email to vikasbajajs@gmail.com or rajatratewal@gmail.com

## Other Sub projects to manage images upload for the marketplace

1. S3 Image Upload : A website is available seperately to upload images into S3, please refer README.MD uploadimages folder

2. Working Heroku Application (to upload images)

   [ImageUploadApp](https://marketplaceimages.herokuapp.com)


## How to Initiate Discussion With ChatBot

1. Start with Hello, Hola as an utterance

2. Another utterance is sell my car 

3. Sit tight and let Bot ask you relevant question for your car

## Architecture

Higl level Overview of Architecture

1. Built using OpenSource framework Serverless using aws-nodejs template

2. Uses Amazon S3, Cloudformation, Cloudwatch, Lambda, DynamoDB and API Gateway as key AWS services

3. Has two distinct flows a) people who want to sell car b) people who are dealers

4. Uses Slack as a platform for creating a marketplace, uses various Slack API's like channel creation, OAuth and Slack commands

5. Supports multiple slack teams that can act as a Dealer or Car seller at the same time, you just need to provide access to your slack team [Market Place Apps](http://marketplaceapps.s3-website-us-east-1.amazonaws.com) 


![TheBot](https://github.com/vikasbguru/awschatbot-unleashed/blob/master/architecture/arch.png)
