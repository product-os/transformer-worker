import Jellyfish from '../src/jellyfish';
import * as jsonpatch from 'fast-json-patch';
import { evaluateFormulaOrValue } from '../src/util';

describe('getBackflowPatch', () => {
	let getBackflowPatch: any;
	let upstreamContract: any;
	let downstreamContract: any;

	beforeEach(() => {
		// Get ref to private method
		const jf = new Jellyfish('', '');
		const jfProto = Object.getPrototypeOf(jf);
		getBackflowPatch = jfProto.getBackflowPatch;

		upstreamContract = {
			x: {},
		};

		downstreamContract = {
			a: true,
			b: 42,
			c: 101,
			d: 'slug',
		};
	});

	describe('should produce correct patch when passed', () => {
		test('simple script', () => {
			const value = evaluateFormulaOrValue(
				{ $$formula: 'ADD(a, b)' },
				{ a: 1, b: 2 },
			);
			expect(value).toEqual(3);
		});

		test('literal source value, static target path', () => {
			const backFlowMapping = [
				{
					downstreamValue: 101,
					upstreamPath: 'x.a',
				},
			];

			const patch = getBackflowPatch(
				backFlowMapping,
				upstreamContract,
				downstreamContract,
			);
			jsonpatch.applyPatch(upstreamContract, patch);

			expect(upstreamContract.x.a).toStrictEqual(101);
		});

		test('formula source value, static target path', () => {
			const backFlowMapping = [
				{
					downstreamValue: {
						$$formula: 'ADD(downstream.b, downstream.c)',
					},
					upstreamPath: 'x.a',
				},
			];

			const patch = getBackflowPatch(
				backFlowMapping,
				upstreamContract,
				downstreamContract,
			);
			jsonpatch.applyPatch(upstreamContract, patch);

			expect(upstreamContract.x.a).toStrictEqual(
				downstreamContract.b + downstreamContract.c,
			);
		});

		test('literal source value, formula derived target path', () => {
			const backFlowMapping = [
				{
					downstreamValue: 'a slug',
					upstreamPath: {
						$$formula: 'downstream.d',
					},
				},
			];

			const patch = getBackflowPatch(
				backFlowMapping,
				upstreamContract,
				downstreamContract,
			);
			jsonpatch.applyPatch(upstreamContract, patch);

			expect(upstreamContract.slug).toStrictEqual('a slug');
		});

		test('multiple mappings', () => {
			const backFlowMapping = [
				{
					downstreamValue: 1,
					upstreamPath: 'x.a',
				},
				{
					downstreamValue: 2,
					upstreamPath: 'x.b',
				},
			];

			const patch = getBackflowPatch(
				backFlowMapping,
				upstreamContract,
				downstreamContract,
			);
			jsonpatch.applyPatch(upstreamContract, patch);

			expect(upstreamContract.x.a).toStrictEqual(1);
			expect(upstreamContract.x.b).toStrictEqual(2);
		});

		test('empty backflowMapping array', () => {
			const backFlowMapping: any = [];

			const patch = getBackflowPatch(
				backFlowMapping,
				upstreamContract,
				downstreamContract,
			);

			expect(patch).toStrictEqual([]);
		});
	});

	describe('should throw error when', () => {
		test('downstreamValue is undefined ', () => {
			const backFlowMapping = [
				{
					upstreamPath: 'x',
				},
			];
			const call = () => {
				getBackflowPatch(backFlowMapping, upstreamContract, downstreamContract);
			};

			expect(call).toThrowError(/missing backflow mapping source/);
		});

		test('downstreamValue contains invalid formula', () => {
			const backFlowMapping = [
				{
					downstreamValue: {
						$$formula: 'not a formula',
					},
					upstreamPath: 'x',
				},
			];
			const call = () => {
				getBackflowPatch(backFlowMapping, upstreamContract, downstreamContract);
			};

			expect(call).toThrowError(/formula eval error/);
		});

		test('upstreamPath is undefined ', () => {
			const backFlowMapping = [
				{
					downstreamValue: 101,
				},
			];
			const call = () => {
				getBackflowPatch(backFlowMapping, upstreamContract, downstreamContract);
			};

			expect(call).toThrowError(/missing backflow mapping target/);
		});

		test('upstreamPath contains invalid formula', () => {
			const backFlowMapping = [
				{
					downstreamValue: 101,
					upstreamPath: {
						$$formula: 'not a formula',
					},
				},
			];
			const call = () => {
				getBackflowPatch(backFlowMapping, upstreamContract, downstreamContract);
			};

			expect(call).toThrowError(/formula eval error/);
		});
	});
});
