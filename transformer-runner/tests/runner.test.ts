import NodeRSA = require('node-rsa');
import * as fs from 'fs';
import { decryptSecrets } from '../src/runner';

describe('secrets handling', () => {
	const secretsKey = new NodeRSA(
		fs.readFileSync('./tests/test-private.key'),
		'pkcs1',
		{ encryptionScheme: 'pkcs1' },
	);
	const testSecret =
		'cCg42DVqtOaFmKHjuEF7mPzpQzgJI1+irV3AWrdSVBuw1PQhs7QKR1ZhAsBKp+RZ+NAX9HUf3yJOs5EuoDBOYCbvsIXCE4K2zbgNUODcygqQjOI0UKZLGSKNTIlVngMhxknWYJZTivavUh/lkmvhig03yvzATstEob6BGpI24LCBUhlota80uMrfzk08rZ/S+j1wcq1d7f6qgpuZ5IZgUw0J0MQLgaf3TvtflX9cCdj73m+ggUIPfx4rVD1q/4FJs7Ak4j0yigxOb3p3KwVjDFR84lPSF/cXlFjrzJQ90r0J9K9IaJYfkn98ALs7aWcaGSQTa7M/KEL/rCT4phhj0Q==';
	const testPlainText = 'das ist ein test\n';

	describe('should decrypt object values in tree', () => {
		test('first level key', () => {
			const result = decryptSecrets(secretsKey, { foo: testSecret });

			expect(Buffer.from(result.foo, 'base64').toString()).toStrictEqual(
				testPlainText,
			);
		});

		test('deep nested key', () => {
			const result = decryptSecrets(secretsKey, {
				a: { b: { c: { foo: testSecret } } },
			});

			expect(Buffer.from(result.a.b.c.foo, 'base64').toString()).toStrictEqual(
				testPlainText,
			);
		});
	});
});
