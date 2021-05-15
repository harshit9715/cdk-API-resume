const cdk = require('@aws-cdk/core');
const route53 = require('@aws-cdk/aws-route53');
const acm = require('@aws-cdk/aws-certificatemanager');

class CdkBlog_DomainStack extends cdk.NestedStack {
    /**
     *
     * @param {cdk.Construct} scope
     * @param {string} id
     * @param {cdk.StackProps=} props = {zone, siteDomain, certificate}
     */
    constructor(scope, id, props) {
        super(scope, id, props);

        this.siteDomain = process.env.DOMAIN_NAME
        this.zone = route53.HostedZone.fromLookup(this, 'Zone', { domainName: this.siteDomain });
        new cdk.CfnOutput(this, 'SiteDomain', { value: 'https://' + this.siteDomain });

        this.certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', process.env.ACM_SSL_ARN);
        new cdk.CfnOutput(this, 'PortfolioCertificateARN', { value: this.certificate.certificateArn });

    }
}

module.exports = { CdkBlog_DomainStack }