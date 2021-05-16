const cdk = require('@aws-cdk/core');
const apigateway = require("@aws-cdk/aws-apigateway");
const { NodejsFunction } = require("@aws-cdk/aws-lambda-nodejs");
const aws_lambda = require("@aws-cdk/aws-lambda");

class CdkBlog_Apig_Lambda_Stack extends cdk.NestedStack {
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

		// * Feature Lambda integrations

		const requestValidatorAll = new apigateway.RequestValidator(this, 'FullValidator', {
			restApi,
			validateRequestParameters: true,
			validateRequestBody: true
		})

		const get_feedbacks = lambda_node14_integ(this, 'get-feedbacks', `${__dirname}/../functions/get-feedbacks/index.js`, 'Resume-');
		const add_feedback = lambda_node14_integ(this, 'add-feedback', `${__dirname}/../functions/add-feedback/index.js`, 'Resume-');
		const update_feedback = lambda_node14_integ(this, 'update-feedback', `${__dirname}/../functions/update-feedback/index.js`, 'Resume-');

		const feedbacks_api = restApi.root.addResource('feedbacks');
		feedbacks_api.addMethod('GET', get_feedbacks)
		feedbacks_api.addMethod('POST', add_feedback, {
			methodResponses: [{
				statusCode: "200"
			}],
			requestModels: { "application/json": newFeedbackModel(this, restApi) },
			requestParameters: {
				'method.request.header.secret': true
			},
			requestValidator: requestValidatorAll

		})
		addMockAPIs(feedbacks_api)

		const feedback_api = feedbacks_api.addResource('{id}')
		feedback_api.addMethod('GET', get_feedbacks)
		feedback_api.addMethod('PUT', update_feedback, {
			methodResponses: [{
				statusCode: "200"
			}],
			requestModels: { "application/json": updateFeedbackModel(this, restApi) },
			requestParameters: {
				'method.request.header.secret': true
			},
			requestValidator: requestValidatorAll
		})
		addMockAPIs(feedback_api)
	}
}

module.exports = { CdkBlog_Apig_Lambda_Stack }

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

// ! Don't use this abstraction if all your functions very are different from each other.

const lambda_node14_integ = (that, functionName, entry, prefix="", handler = "handler") => {
	const fxn = new NodejsFunction(that, functionName, {
		functionName: prefix + functionName,
		entry,
		handler,
		runtime: aws_lambda.Runtime.NODEJS_14_X,
		environment: {
			MONGO_CONNECTION_STRING: process.env.MONGO_CONNECTION_STRING
		},
		bundling: {
			minify: false,
			nodeModules: [
				'mongodb', // mongodb for mongo connection
			],
			externalModules: [
				'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
			],
		},
	});
	return new apigateway.LambdaIntegration(fxn);
}


const newFeedbackModel = (scope, restAPI) => {
	return new apigateway.Model(scope, "NewFeedback", {
		restApi: restAPI,
		contentType: "application/json",
		schema: {
			schema: apigateway.JsonSchemaVersion.DRAFT7,
			title: "NewFeedback",
			type: apigateway.JsonSchemaType.OBJECT,
			properties: {
				feedback: {
					type: apigateway.JsonSchemaType.STRING,
					minLength: 5
				},
				name: {
					type: apigateway.JsonSchemaType.STRING,
					default: "Anonymous"
				}
			},
			required: ['feedback']
		}
	});
}

const updateFeedbackModel = (scope, restAPI) => {
	return new apigateway.Model(scope, "UpdateFeedback", {
		restApi: restAPI,
		contentType: "application/json",
		schema: {
			schema: apigateway.JsonSchemaVersion.DRAFT7,
			title: "UpdateFeedback",
			type: apigateway.JsonSchemaType.OBJECT,
			properties: {
				feedback: {
					type: apigateway.JsonSchemaType.STRING,
					minLength: 5
				},
			},
			required: ['feedback']
		}
	});
}