import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins';
import type { Construct } from 'constructs';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Reads the rewrite rule and strips the `export` keyword.
 *
 * The file is written as an ES module so tests and the local server can import
 * it without any evaluation tricks; the CloudFront Functions runtime wants a
 * bare `function handler`, and that keyword is the only difference.
 */
function readEdgeFunction(): string {
	const source = fs.readFileSync(path.join(__dirname, '../edge/rewrite.js'), 'utf8');
	return source.replace(/^export function handler/m, 'function handler');
}

/**
 * The site is a folder of prerendered files on S3, fronted by CloudFront.
 *
 * There is no compute in the request path. A page view is an edge cache hit,
 * or on a miss a single read from S3. The only code that runs per request is
 * the CloudFront Function that maps a clean URL onto its `.html` key.
 */
export class GanhammarStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const siteBucket = new s3.Bucket(this, 'StaticBucket', {
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
			enforceSSL: true
		});

		const rewriteFunction = new cloudfront.Function(this, 'RewriteFunction', {
			runtime: cloudfront.FunctionRuntime.JS_2_0,
			code: cloudfront.FunctionCode.fromInline(readEdgeFunction()),
			comment: 'Maps clean URLs onto the prerendered .html keys in S3'
		});

		// Fingerprinted filenames can be cached in the browser forever. The
		// deployment writes one Cache-Control for every object, so the long TTL
		// is applied here, per path, instead.
		const immutableHeaders = new cloudfront.ResponseHeadersPolicy(this, 'ImmutableHeaders', {
			customHeadersBehavior: {
				customHeaders: [
					{
						header: 'Cache-Control',
						value: 'public, max-age=31536000, immutable',
						override: true
					}
				]
			}
		});

		const origin = cloudfrontOrigins.S3BucketOrigin.withOriginAccessControl(siteBucket);

		const staticBehavior: cloudfront.BehaviorOptions = {
			origin,
			viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
			cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
			compress: true
		};

		const distribution = new cloudfront.Distribution(this, 'Distribution', {
			defaultRootObject: 'index.html',
			defaultBehavior: {
				...staticBehavior,
				functionAssociations: [
					{
						function: rewriteFunction,
						eventType: cloudfront.FunctionEventType.VIEWER_REQUEST
					}
				]
			},
			additionalBehaviors: {
				// Already carry a content hash in the filename, and need no URL
				// rewriting, so they skip the function and take the long TTL.
				'/_app/immutable/*': {
					...staticBehavior,
					responseHeadersPolicy: immutableHeaders
				},
				'/posts/assets/*': staticBehavior
			},
			errorResponses: [
				{
					// A private bucket answers 403 for a key that is not there.
					httpStatus: 403,
					responseHttpStatus: 404,
					responsePagePath: '/404.html',
					ttl: cdk.Duration.minutes(5)
				},
				{
					httpStatus: 404,
					responseHttpStatus: 404,
					responsePagePath: '/404.html',
					ttl: cdk.Duration.minutes(5)
				}
			],
			priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
			httpVersion: cloudfront.HttpVersion.HTTP2_AND_3
		});

		// One deployment for the whole build so that pruning stays accurate: a
		// post that is deleted upstream disappears from the bucket too. Pages get
		// a short browser TTL and a long CDN TTL, and the CDN copy is invalidated
		// here on every deploy.
		new s3deploy.BucketDeployment(this, 'DeploySite', {
			sources: [s3deploy.Source.asset(path.join(__dirname, '../../build'))],
			destinationBucket: siteBucket,
			distribution,
			distributionPaths: ['/*'],
			prune: true,
			cacheControl: [
				s3deploy.CacheControl.setPublic(),
				s3deploy.CacheControl.maxAge(cdk.Duration.minutes(5)),
				s3deploy.CacheControl.sMaxAge(cdk.Duration.days(365))
			],
			memoryLimit: 512
		});

		new cdk.CfnOutput(this, 'DistributionDomainName', {
			value: distribution.distributionDomainName
		});

		new cdk.CfnOutput(this, 'BucketName', { value: siteBucket.bucketName });
	}
}
