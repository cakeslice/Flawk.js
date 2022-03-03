import tracer from 'dd-trace'
if (process.env.JEST !== 'true')
	tracer.init({
		service: process.env.frontendURL ? process.env.frontendURL.split('//')[1] : 'unknown-app',
		version: process.env.CAPROVER_GIT_COMMIT_SHA || 'unknown-version',
		logInjection: true,
		appsec: true,
		profiling: true,
		hostname: 'host.docker.internal',
	})
export default tracer
