const cdk = require('@aws-cdk/core');
const apigateway = require("@aws-cdk/aws-apigateway");
const iam = require("@aws-cdk/aws-iam");


class CdkBlog_Apig_s3_Stack extends cdk.NestedStack {
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

		// * Feature - s3 image API

		const exeRole = iam.Role.fromRoleArn(this, 'Role', 'arn:aws:iam::455180012233:role/resumeAPIGatewayRole', {
			mutable: false,
		});

		const picture_api = restApi.root.addResource('picture');
		const me_api = picture_api.addResource('me');
		const earth_api = picture_api.addResource('earth');

		const my_picture_integ = new apigateway.AwsIntegration({
			service: 's3',
			// region: this.region,
			integrationHttpMethod: "GET",
			path: '${stageVariables.StaticObjectBucketName}/images/profile.jpg',
			options: {
				contentHandling: apigateway.ContentHandling.CONVERT_TO_BINARY,
				credentialsRole: exeRole,
			}
		})

		const earth_integ = new apigateway.AwsIntegration({
			service: 's3',
			// region: this.region,
			integrationHttpMethod: "GET",
			path: '${stageVariables.StaticObjectBucketName}/GoogleEarthWallpaper/{fileName}.jpg',
			options: {
				contentHandling: apigateway.ContentHandling.CONVERT_TO_BINARY,
				credentialsRole: exeRole,
			},
		})

		me_api.addMethod('GET', my_picture_integ, {
			methodResponses: [{
				statusCode: "200",
			}],

		})
		earth_api.addMethod('GET', earth_integ, {
			methodResponses: [{
				statusCode: "200"
			}]
		})
		addMockAPIs(me_api)
		addMockAPIs(earth_api)

	}
}

module.exports = { CdkBlog_Apig_s3_Stack }

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
