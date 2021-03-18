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
        
        test("static source path, static target path", () => {
            const backFlowMapping = [{
                downstreamPath: 'a',
                upstreamPath: 'x.a',
            }];
            
            const patch = getBackflowPatch(backFlowMapping, upstreamContract, downstreamContract);
            jsonpatch.applyPatch(upstreamContract, patch);
            
            expect(upstreamContract.x.a).toStrictEqual(downstreamContract.a);
        });

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

        test("static source path, static target path", () => {
            const backFlowMapping = [{
                downstreamPath: 'a',
                upstreamPath:  {
                    $$formula: 'this.downstream.d',
                },
            }];

            const patch = getBackflowPatch(backFlowMapping, upstreamContract, downstreamContract);
            jsonpatch.applyPatch(upstreamContract, patch);

            expect(upstreamContract.slug).toStrictEqual(downstreamContract.a);
        });

        test("multiple mappings", () => {
            const backFlowMapping = [
                {
                downstreamPath: 'a',
                upstreamPath: 'x.a',
                },
                {
                    downstreamPath: 'b',
                    upstreamPath: 'x.b',
                }
            ];

            const patch = getBackflowPatch(backFlowMapping, upstreamContract, downstreamContract);
            jsonpatch.applyPatch(upstreamContract, patch);

            expect(upstreamContract.x.a).toStrictEqual(downstreamContract.a);
            expect(upstreamContract.x.b).toStrictEqual(downstreamContract.b);
        });

        test("empty backflowMapping array", () => {
            const backFlowMapping: any = [];

            const patch = getBackflowPatch(backFlowMapping, upstreamContract, downstreamContract);
            
            expect(patch).toStrictEqual([]);
        });
    });

    describe("should throw error when", () => {

        test("downstreamPath points to undefined value", () => {
            const backFlowMapping = [{
                downstreamPath: 'f',
                upstreamPath: 'x',
            }];
            const call = () => {
                getBackflowPatch(backFlowMapping, upstreamContract, downstreamContract);
            }
            
            expect(call).toThrowError(/Could not read path/);
        });

        test("both downstreamPath and downstreamValue are undefined ", () => {
            const backFlowMapping = [{
                upstreamPath: 'x',
            }];
            const call = () => {
                getBackflowPatch(backFlowMapping, upstreamContract, downstreamContract);
            }

            expect(call).toThrowError(/No backflow mapping source specified for contract/);
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

        test("upstreamPath contains invalid formula", () => {
            const backFlowMapping = [{
                downstreamPath: 'a',
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
