import test from 'node:test';
import assert from 'node:assert/strict';
import { serviceEndpoint } from '../src/server.mjs';

test('uses an encrypted transport for service requests', () => {
  assert.equal(serviceEndpoint(), 'https://api.example.test');
});
