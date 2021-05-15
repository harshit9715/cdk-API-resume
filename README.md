# API Resume with AWS CDK

Clean code to deploy API resume on AWS and link it to a custom domain.

## Motivation

I created my API resume manually at AWS and I want to automate the entire process.

## AWS Resources used

- Route 53 Hosted Zone and Alias Records
- ACM for SSL certificate
- API Gateway for APIs
- Lambdas for compute
- s3 for storgae

## Prerequisite (All are optional but you need to alter code a little if you dont have these)

- A Domain name
- An SSL certificate created on AWS ACM.
- A mongoDB cluster (I have 3 lambda APIs that talks to mongodb (You can comment it out in backend index.js and deploy only mocks and s3 APIs))
- s3 bucket APIs.

## Usage

```bash

cdk synth
cdk deploy

```
Create a .env file and populate all required parameters. (check sampleenv for reference)
