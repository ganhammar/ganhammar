// The whole site is static. `prerender` bakes every route to HTML at build
// time; `csr: false` means none of the SvelteKit client runtime is shipped,
// because nothing on these pages needs to be interactive. The only script on
// the site is the handful of lines in app.html that light up the contents
// rail while reading.
export const prerender = true;
export const csr = false;
export const trailingSlash = 'never';
