const cdk = require('@aws-cdk/core');
const apigateway = require("@aws-cdk/aws-apigateway");
const route53 = require('@aws-cdk/aws-route53');
const targets = require('@aws-cdk/aws-route53-targets/lib');

const { CdkBlog_ApigMockStack } = require('./apig-mocks');
const { CdkBlog_Apig_Lambda_Stack} = require('./apig-lambda');
const { CdkBlog_Apig_s3_Stack} = require('./apig-s3');


class CdkBlog_ApigStack extends cdk.NestedStack {
	/**
	 *
	 * @param {cdk.Construct} scope
	 * @param {string} id
	 * @param {cdk.StackProps=} props
	 */
	constructor(scope, id, props) {
		super(scope, id, props);

		// REST API For backend APIs

		const restApi = new apigateway.RestApi(this, "API-Resume", {
			restApiName: 'API-Resume',
			binaryMediaTypes: ['image/*'],
			deploy: false,
			endpointTypes: [apigateway.EndpointType.EDGE],
		});
        
        new CdkBlog_ApigMockStack(this, "ApigMockStack", {
            stackName: "ApigMockStack",
            api: restApi
        })

        new CdkBlog_Apig_Lambda_Stack(this, "ApigLambdaStack", {
            stackName: "ApigLambdaStack",
            api: restApi
        })

        new CdkBlog_Apig_s3_Stack(this, "Apigs3Stack", {
            stackName: "Apigs3Stack",
            api: restApi
        })


		// * API Deployment and Stage settings

		const deployment = new apigateway.Deployment(this, 'Resume deployment', { api: restApi, retainDeployments: false });

		// And different stages
		// const [devStage, testStage, prodStage] = ['dev', 'test', 'prod'].map(item =>
		const [prodStage] = ['prod'].map(item =>
			new apigateway.Stage(this, `${item}_stage`, {
				deployment, stageName: item, variables: {
					StaticObjectBucketName: 'portfolio-9715'
				}
			}));

		restApi.deploymentStage = prodStage;


		// ? For custom domain name configuration

		const { zone, siteDomain, certificate } = props;


		const domain = new apigateway.DomainName(this, "prod-domain", {
			domainName: 'api.' + siteDomain,
			certificate,
			endpointType: apigateway.EndpointType.EDGE,
			securityPolicy: apigateway.SecurityPolicy.TLS_1_2
		});

		restApi.addDomainName('rest-domain', {
			domainName: siteDomain,
			securityPolicy: apigateway.SecurityPolicy.TLS_1_2,
			certificate
		})

		domain.addBasePathMapping(restApi, { stage: prodStage })

		new route53.ARecord(this, "api_a_record", {
			recordName: "api." + siteDomain,
			zone,
			target: route53.RecordTarget.fromAlias(new targets.ApiGateway(restApi))
		});
	}
}

module.exports = { CdkBlog_ApigStack }