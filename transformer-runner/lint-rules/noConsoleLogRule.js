"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.Rule = void 0;
var Lint = require("tslint");
var ts = require("typescript");
var tsutils = require("tsutils");
// NOTE
// you currently have to manually compile this file, if you make changes to it!
// $ npx tsc noConsoleLogRule.ts
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithFunction(sourceFile, walk);
    };
    Rule.FAILURE_STRING = 'use a logging library instead of console.log/error';
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
function walk(ctx) {
    function cb(node) {
        if (!ctx.sourceFile.fileName.includes('test') &&
            !ctx.sourceFile.fileName.includes('spec')) {
            if (tsutils.isCallExpression(node)) {
                var call = node.expression;
                if (tsutils.isPropertyAccessExpression(call)) {
                    var callSubj = call.expression;
                    if (tsutils.isIdentifier(callSubj)) {
                        if (callSubj.text === 'console' &&
                            ['log', 'error'].includes(call.name.text))
                            ctx.addFailureAt(node.getStart(), node.getWidth(), Rule.FAILURE_STRING);
                    }
                }
            }
        }
        return ts.forEachChild(node, cb);
    }
    return ts.forEachChild(ctx.sourceFile, cb);
}
