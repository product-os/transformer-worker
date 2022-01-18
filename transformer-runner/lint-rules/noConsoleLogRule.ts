import * as Lint from 'tslint';
import * as ts from 'typescript';
import * as tsutils from 'tsutils';


// NOTE
// you currently have to manually compile this file, if you make changes to it!
// $ npx tsc noConsoleLogRule.ts

export class Rule extends Lint.Rules.AbstractRule {
	public static FAILURE_STRING = 'use a logging library instead of console.log/error';

	public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
		return this.applyWithFunction(sourceFile, walk);
	}
}

function walk(ctx: Lint.WalkContext<void>) {
	function cb(node: ts.Node): void {
		if (
			!ctx.sourceFile.fileName.includes('test') &&
			!ctx.sourceFile.fileName.includes('spec')
		) {
			if (tsutils.isCallExpression(node)) {
				const call = node.expression;
				if (tsutils.isPropertyAccessExpression(call)) {
					const callSubj = call.expression;
					if (tsutils.isIdentifier(callSubj)) {
						if (
							callSubj.text === 'console' &&
							['log', 'error'].includes(call.name.text)
						)
							ctx.addFailureAt(
								node.getStart(),
								node.getWidth(),
								Rule.FAILURE_STRING,
							);
					}
				}
			}
		}

		return ts.forEachChild(node, cb);
	}

	return ts.forEachChild(ctx.sourceFile, cb);
}
