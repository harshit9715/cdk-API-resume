const cdk = require('@aws-cdk/core');

const { CdkBlog_DomainStack } = require('../domain-stack');
const { CdkBlog_ApigStack } = require('./apis')


class CdkBlog_BackendStack extends cdk.Stack {
	/**
	 *
	 * @param {cdk.Construct} scope
	 * @param {string} id
	 * @param {cdk.StackProps=} props
	 */
	constructor(scope, id, props) {
		super(scope, id, props);
		
		const { certificate, siteDomain, zone } = new CdkBlog_DomainStack(this, 'DomainStack', {stackName: "DomainChildStack"})
		new CdkBlog_ApigStack(this, 'ApigStack', {
			stackName: "ApigStack",
			certificate,
			siteDomain,
			zone
		})
	}
}

module.exports = { CdkBlog_BackendStack }