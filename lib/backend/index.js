const cdk = require('@aws-cdk/core');

const { CdkBlog_DomainStack } = require('../domain-stack');
const { CdkBlog_ApigStack } = require('./apis')
const { CdkBlog_StorageStack } = require('./storage')
const { CdkBlog_CDNStack } = require('./cdn')

class CdkBlog_BackendStack extends cdk.Stack {
	/**
	 *
	 * @param {cdk.Construct} scope
	 * @param {string} id
	 * @param {cdk.StackProps=} props
	 */
	constructor(scope, id, props) {
		super(scope, id, props);
		
		const { certificate, siteDomain, zone } = new CdkBlog_DomainStack(this, 'Domain', {stackName: "Domain"})

		new CdkBlog_ApigStack(this, 'Apig', {
			stackName: "Apig",
			certificate,
			siteDomain,
			zone
		})
		const { websiteBucket, cloudfrontOAI } = new CdkBlog_StorageStack(this, 'S3', {
			stackName: 'S3'
		})

		new CdkBlog_CDNStack(this, 'CDN', {
			stackName: 'CDN',
			websiteBucket,
			certificate,
			cloudfrontOAI,
			siteDomain,
			zone
		})

		

	}
}

module.exports = { CdkBlog_BackendStack }