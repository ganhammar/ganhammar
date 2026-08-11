// The URL rewriting rule, in one place.
//
// S3 stores the prerendered pages under their real keys (`about.html`), but
// visitors ask for `/about`. This maps one to the other so the origin can stay
// a plain private bucket with no website hosting enabled.
//
// It is deployed as a CloudFront Function (viewer-request, runtime
// cloudfront-js-2.0): infra/lib/stack.ts reads this file and drops the
// `export` keyword, which is the only thing that runtime will not accept.
// e2e/serve.mjs imports it as an ordinary module, so local runs resolve URLs
// through exactly the rules that run at the edge.

export function handler(event) {
	var request = event.request;
	var uri = request.uri;
	var lastSegment = uri.substring(uri.lastIndexOf('/') + 1);

	if (uri.endsWith('/')) {
		request.uri = uri + 'index.html';
	} else if (lastSegment.indexOf('.') === -1) {
		request.uri = uri + '.html';
	}

	return request;
}
