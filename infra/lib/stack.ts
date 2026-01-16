import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayIntegrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins';
import type { Construct } from 'constructs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class GanhammarStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// S3 bucket for static assets
		const staticBucket = new s3.Bucket(this, 'StaticBucket', {
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			autoDeleteObjects: true,
			blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL
		});

		// Deploy static assets to S3 (fonts from static folder)
		new s3deploy.BucketDeployment(this, 'DeployStaticAssets', {
			sources: [s3deploy.Source.asset(path.join(__dirname, '../../static'))],
			destinationBucket: staticBucket,
			cacheControl: [s3deploy.CacheControl.maxAge(cdk.Duration.days(365))]
		});

		// Deploy SvelteKit client assets to S3
		new s3deploy.BucketDeployment(this, 'DeploySvelteKitAssets', {
			sources: [s3deploy.Source.asset(path.join(__dirname, '../../build/client'))],
			destinationBucket: staticBucket,
			destinationKeyPrefix: '_app',
			cacheControl: [s3deploy.CacheControl.maxAge(cdk.Duration.days(365))]
		});

		// Lambda function for SvelteKit SSR
		// Expects build to be done before CDK deploy
		const svelteKitFunction = new lambda.Function(this, 'SvelteKitFunction', {
			runtime: lambda.Runtime.NODEJS_20_X,
			handler: 'index.handler',
			code: lambda.Code.fromAsset(path.join(__dirname, '../../build')),
			memorySize: 1024,
			timeout: cdk.Duration.seconds(30),
			environment: {
				NODE_ENV: 'production',
				API_TOKEN: process.env.API_TOKEN || ''
			}
		});

		// API Gateway HTTP API
		const httpApi = new apigateway.HttpApi(this, 'HttpApi', {
			apiName: 'ganhammar-api'
		});

		// Add Lambda integration
		httpApi.addRoutes({
			path: '/{proxy+}',
			methods: [apigateway.HttpMethod.ANY],
			integration: new apigatewayIntegrations.HttpLambdaIntegration(
				'LambdaIntegration',
				svelteKitFunction
			)
		});

		// Add root path
		httpApi.addRoutes({
			path: '/',
			methods: [apigateway.HttpMethod.ANY],
			integration: new apigatewayIntegrations.HttpLambdaIntegration(
				'LambdaIntegrationRoot',
				svelteKitFunction
			)
		});

		// Origin Access Identity for S3
		const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI');
		staticBucket.grantRead(originAccessIdentity);

		// CloudFront distribution
		const distribution = new cloudfront.Distribution(this, 'Distribution', {
			defaultBehavior: {
				origin: new cloudfrontOrigins.HttpOrigin(
					`${httpApi.httpApiId}.execute-api.${this.region}.amazonaws.com`
				),
				viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
				allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
				cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
				originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER
			},
			additionalBehaviors: {
				'/_app/*': {
					origin: new cloudfrontOrigins.S3Origin(staticBucket, { originAccessIdentity }),
					viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
					cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED
				},
				'/*.ttf': {
					origin: new cloudfrontOrigins.S3Origin(staticBucket, { originAccessIdentity }),
					viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
					cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED
				},
				'/*.woff': {
					origin: new cloudfrontOrigins.S3Origin(staticBucket, { originAccessIdentity }),
					viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
					cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED
				},
				'/*.woff2': {
					origin: new cloudfrontOrigins.S3Origin(staticBucket, { originAccessIdentity }),
					viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
					cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED
				}
			},
			priceClass: cloudfront.PriceClass.PRICE_CLASS_100
		});

		new cdk.CfnOutput(this, 'DistributionDomainName', {
			value: distribution.distributionDomainName
		});

		new cdk.CfnOutput(this, 'ApiUrl', {
			value: httpApi.url || ''
		});
	}
}
