import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// These will be imported dynamically after build
let server: any;
let initialized = false;

async function initServer() {
	if (initialized) return;

	// Import the SvelteKit Server and manifest from the build directory
	// When running in Lambda, this file is at /var/task/index.mjs
	// and the build files are at /var/task/server/
	const { Server } = await import('./server/index.js');
	const { manifest } = await import('./server/manifest.js');

	server = new Server(manifest);

	await server.init({
		env: process.env,
		read: (file: string) => {
			// Read client assets from the client directory
			const filePath = join(__dirname, 'client', file);
			return readFileSync(filePath);
		}
	});

	initialized = true;
}

export async function handler(
	event: APIGatewayProxyEventV2,
	context: Context
): Promise<APIGatewayProxyResultV2> {
	// Initialize server on first request (cold start)
	await initServer();

	// Convert API Gateway v2 event to a Web Request
	const { requestContext, headers, rawPath, rawQueryString, body, isBase64Encoded } = event;

	const scheme = headers['x-forwarded-proto'] || 'https';
	const host = headers['host'] || requestContext.domainName;
	const url = `${scheme}://${host}${rawPath}${rawQueryString ? `?${rawQueryString}` : ''}`;

	const method = requestContext.http.method;

	// Build headers for the request
	const requestHeaders = new Headers();
	for (const [key, value] of Object.entries(headers)) {
		if (value) {
			requestHeaders.set(key, value);
		}
	}

	// Handle request body
	let requestBody: BodyInit | undefined;
	if (body) {
		requestBody = isBase64Encoded ? Buffer.from(body, 'base64') : body;
	}

	// Create Web Request
	const request = new Request(url, {
		method,
		headers: requestHeaders,
		body: method !== 'GET' && method !== 'HEAD' ? requestBody : undefined
	});

	try {
		// Call the SvelteKit server.respond()
		const response: Response = await server.respond(request, {
			platform: { event, context },
			getClientAddress: () => {
				// Try to get client IP from X-Forwarded-For header
				const xff = headers['x-forwarded-for'];
				if (xff) {
					return xff.split(',')[0].trim();
				}
				return requestContext.http.sourceIp || '0.0.0.0';
			}
		});

		// Convert Web Response to API Gateway v2 response
		const responseHeaders: Record<string, string> = {};
		response.headers.forEach((value, key) => {
			responseHeaders[key] = value;
		});

		// Read the response body
		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Check if response should be base64 encoded (binary content)
		const contentType = response.headers.get('content-type') || '';
		const isBinary =
			contentType.startsWith('image/') ||
			contentType.startsWith('audio/') ||
			contentType.startsWith('video/') ||
			contentType.startsWith('application/octet-stream') ||
			contentType.includes('font');

		return {
			statusCode: response.status,
			headers: responseHeaders,
			body: isBinary ? buffer.toString('base64') : buffer.toString('utf-8'),
			isBase64Encoded: isBinary
		};
	} catch (error) {
		console.error('Handler error:', error);
		return {
			statusCode: 500,
			headers: { 'content-type': 'text/plain' },
			body: 'Internal Server Error'
		};
	}
}
