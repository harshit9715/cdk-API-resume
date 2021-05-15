const cdk = require('@aws-cdk/core');
const apigateway = require("@aws-cdk/aws-apigateway");

// Mock APIs
const {
	awards,
	basics,
	education,
	full,
	interests,
	references,
	skills,
	work } = require('./mocks');

class CdkBlog_ApigMockStack extends cdk.NestedStack {
	/**
	 *
	 * @param {cdk.Construct} scope
	 * @param {string} id
	 * @param {cdk.StackProps=} props
	 */
	constructor(scope, id, props) {
		super(scope, id, props);

		// REST API For backend APIs

		const restApi = props.api

		// fullProfileMock and its CORS
		addMockAPIs(restApi.root, 'GET', full);
		addMockAPIs(restApi.root)


		const my_profile_sections = { basics, awards, work, skills, references, interests, education }

		Object.keys(my_profile_sections).forEach(section => {
			console.log('section', JSON.stringify(my_profile_sections[section]));
			const section_api = restApi.root.addResource(section);
			// Create Method
			addMockAPIs(section_api, 'GET', my_profile_sections[section])
			// Handle CORS
			addMockAPIs(section_api)
		})

	}
}

module.exports = { CdkBlog_ApigMockStack }

// Default behavior is to enable cors.
function addMockAPIs(apiResource, method = 'OPTIONS', responseTemplatesObject = undefined) {
	apiResource.addMethod(method, new apigateway.MockIntegration({
		integrationResponses: [{
			statusCode: '200',
			responseParameters: {
				'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
				'method.response.header.Access-Control-Allow-Origin': "'*'",
				'method.response.header.Access-Control-Allow-Credentials': "'false'",
				'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
			},
			responseTemplates: responseTemplatesObject ? {
				"application/json": JSON.stringify(responseTemplatesObject)
			} : undefined
		}],
		passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
		requestTemplates: {
			"application/json": "{\"statusCode\": 200}"
		}
	}), {
		methodResponses: [{
			statusCode: '200',
			responseParameters: {
				'method.response.header.Access-Control-Allow-Headers': true,
				'method.response.header.Access-Control-Allow-Methods': true,
				'method.response.header.Access-Control-Allow-Credentials': true,
				'method.response.header.Access-Control-Allow-Origin': true,
			},
		}]
	});
}
