import Jellyfish from "../src/jellyfish";
import * as jsonpatch from 'fast-json-patch';

describe("getBackflowPatch", () => {
    let getBackflowPatch : any, 
        upstreamContract : any, 
        downstreamContract: any;

    beforeEach(() => {
        // Get ref to private method
        const jf = new Jellyfish('','');
        const jfProto = Object.getPrototypeOf(jf);
        getBackflowPatch = jfProto.getBackflowPatch;
        
        upstreamContract = {
            x : {},
        }
        
        downstreamContract = {
            a: true,
            b: 42,
            c: 101,
            d: 'slug',
        }
    });

    describe("should produce correct patch when passed", () => {
        
        test("literal source value, static target path", () => {
            const backFlowMapping = [{
                downstreamValue: 101,
                upstreamPath: 'x.a',
            }];

            const patch = getBackflowPatch(backFlowMapping, upstreamContract, downstreamContract);
            jsonpatch.applyPatch(upstreamContract, patch);

            expect(upstreamContract.x.a).toStrictEqual(101);
        });

        test("formula source value, static target path", () => {
            const backFlowMapping = [{
                downstreamValue: {
                    $$formula: 'ADD(this.downstream.b, this.downstream.c)',
                },
                upstreamPath: 'x.a',
            }];

            const patch = getBackflowPatch(backFlowMapping, upstreamContract, downstreamContract);
            jsonpatch.applyPatch(upstreamContract, patch);

            expect(upstreamContract.x.a).toStrictEqual(downstreamContract.b + downstreamContract.c);
        });

        test("literal source value, formula derived target path", () => {
            const backFlowMapping = [{
                downstreamValue: 'a slug',
                upstreamPath:  {
                    $$formula: 'this.downstream.d',
                },
            }];

            const patch = getBackflowPatch(backFlowMapping, upstreamContract, downstreamContract);
            jsonpatch.applyPatch(upstreamContract, patch);

            expect(upstreamContract.slug).toStrictEqual('a slug');
        });

        test("multiple mappings", () => {
            const backFlowMapping = [
                {
                    downstreamValue: 1,
                    upstreamPath: 'x.a',
                },
                {
                    downstreamValue: 2,
                    upstreamPath: 'x.b',
                }
            ];

            const patch = getBackflowPatch(backFlowMapping, upstreamContract, downstreamContract);
            jsonpatch.applyPatch(upstreamContract, patch);

            expect(upstreamContract.x.a).toStrictEqual(1);
            expect(upstreamContract.x.b).toStrictEqual(2);
        });

        test("empty backflowMapping array", () => {
            const backFlowMapping: any = [];

            const patch = getBackflowPatch(backFlowMapping, upstreamContract, downstreamContract);
            
            expect(patch).toStrictEqual([]);
        });
    });

    describe("should throw error when", () => {
        
        test("downstreamValue is undefined ", () => {
            const backFlowMapping = [{
                upstreamPath: 'x',
            }];
            const call = () => {
                getBackflowPatch(backFlowMapping, upstreamContract, downstreamContract);
            }

            expect(call).toThrowError(/Missing backflow mapping source/);
        });

        test("downstreamValue contains invalid formula", () => {
            const backFlowMapping = [{
                downstreamValue: {
                    $$formula: 'not a formula'
                },
                upstreamPath: 'x',
            }];
            const call = () => {
                getBackflowPatch(backFlowMapping, upstreamContract, downstreamContract);
            }

            expect(call).toThrowError(/Formula eval error/);
        });

        test("upstreamPath is undefined ", () => {
            const backFlowMapping = [{
                downstreamValue: 101,
            }];
            const call = () => {
                getBackflowPatch(backFlowMapping, upstreamContract, downstreamContract);
            }

            expect(call).toThrowError(/Missing backflow mapping target/);
        });

        test("upstreamPath contains invalid formula", () => {
            const backFlowMapping = [{
                downstreamValue: 101,
                upstreamPath: {
                    $$formula: 'not a formula'
                },
            }];
            const call = () => {
                getBackflowPatch(backFlowMapping, upstreamContract, downstreamContract);
            }

            expect(call).toThrowError(/Formula eval error/);
        });
    });
});