const cdk = require('@aws-cdk/core');
const s3 = require("@aws-cdk/aws-s3");
// const iam = require("@aws-cdk/aws-iam");
// const cloudfront = require("@aws-cdk/aws-cloudfront");
const s3deploy = require("@aws-cdk/aws-s3-deployment");

class CdkBlog_FrontendStack extends cdk.NestedStack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    // Frontend code goes below

    const websiteBucket = new s3.Bucket(this, "BlogBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          allowedOrigins: ["*"],
          allowedMethods: [s3.HttpMethods.GET],
          maxAge: 3000,
        },
      ],
    });
    new s3deploy.BucketDeployment(this, "Portfolio", {
      sources: [s3deploy.Source.asset(`${__dirname}/assets`)],
      destinationBucket: websiteBucket,
    });

    this.websiteBucket = websiteBucket;

    
  }
}



module.exports = { CdkBlog_FrontendStack }