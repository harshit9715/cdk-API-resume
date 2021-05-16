const cdk = require('@aws-cdk/core');
const cloudfront = require("@aws-cdk/aws-cloudfront");
const origins = require('@aws-cdk/aws-cloudfront-origins');
const route53 = require('@aws-cdk/aws-route53');
const targets = require('@aws-cdk/aws-route53-targets/lib');

class CdkBlog_CDNStack extends cdk.NestedStack {
    /**
     *
     * @param {cdk.Construct} scope
     * @param {string} id
     * @param {cdk.StackProps=} props
     */
    constructor(scope, id, props) {
        super(scope, id, props);

        const {websiteBucket, certificate, siteDomain, cloudfrontOAI, zone} = props;

        const distribution = new cloudfront.Distribution(this, 'CDKBlog_CDN', {
            certificate,
            domainNames: [siteDomain],
            defaultBehavior: {
                origin: new origins.S3Origin(websiteBucket, {
                    originAccessIdentity: cloudfrontOAI
                }),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
            },
        })

        new route53.ARecord(this, "Blog-Record", {
			recordName: siteDomain,
			zone,
			target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution))
		});

        // this.distribution = distribution;
    }
}

module.exports = { CdkBlog_CDNStack }