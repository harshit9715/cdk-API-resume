const cdk = require('@aws-cdk/core');
const s3 = require("@aws-cdk/aws-s3");
const cloudfront = require("@aws-cdk/aws-cloudfront");
const s3deploy = require("@aws-cdk/aws-s3-deployment");
const iam = require("@aws-cdk/aws-iam");

class CdkBlog_StorageStack extends cdk.NestedStack {
    /**
     *
     * @param {cdk.Construct} scope
     * @param {string} id
     * @param {cdk.StackProps=} props
     */
    constructor(scope, id, props) {
        super(scope, id, props);

        // ? If bucket exists
        // const websiteBucket = s3.Bucket.fromBucketName(this, 'blog_bucket', process.env.BLOG_BUCKET_NAME)
        
        const websiteBucket = new s3.Bucket(this, "BlogBucket", {
            bucketName: process.env.BLOG_BUCKET_NAME,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: '404.html',
            publicReadAccess: true,
            cors: [
              {
                allowedOrigins: ["*"],
                allowedMethods: [s3.HttpMethods.GET],
                maxAge: 3000,
              },
            ],
          });
        
        
        // ? If you have static assets to be placed in the bucket. I am commenting this out since my assets are pushed from another github action.

        new s3deploy.BucketDeployment(this, "Portfolio", {
            sources: [s3deploy.Source.asset(`${__dirname}/../../assets`)],
            destinationBucket: websiteBucket,
        });

        const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, "CloudFrontOAI", {
          comment: `Allows CloudFront access to S3 bucket`,
      });

        websiteBucket.addToResourcePolicy(new iam.PolicyStatement({
          sid: "Grant Cloudfront Origin Access Identity access to S3 bucket",
          actions: ["s3:GetObject"],
          resources: [websiteBucket.bucketArn + "/*"],
          principals: [cloudfrontOAI.grantPrincipal],
      }));
        this.cloudfrontOAI = cloudfrontOAI;
        this.websiteBucket = websiteBucket;
    }
}

module.exports = { CdkBlog_StorageStack }