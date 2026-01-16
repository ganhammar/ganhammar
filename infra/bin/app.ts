#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { GanhammarStack } from '../lib/stack.js';

const app = new cdk.App();

new GanhammarStack(app, 'GanhammarStack', {
	env: {
		account: process.env.CDK_DEFAULT_ACCOUNT,
		region: process.env.CDK_DEFAULT_REGION || 'eu-north-1'
	}
});

app.synth();
