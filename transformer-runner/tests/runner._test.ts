import * as fs from 'fs';
import runner = require('../src/runner');

const task = JSON.parse(fs.readFileSync('./fixtures/task.json', 'utf-8'));

describe('getDir', () => {
	const getDir = runner.__get__('getDir');
	const INPUT_DIR = runner.__get__('INPUT_DIR');
	const OUTPUT_DIR = runner.__get__('OUTPUT_DIR');

	test('should return the correct input dir', () => {
		const dir = getDir.input(task);
		expect(dir).toEqual(
			`${INPUT_DIR}task-5ea68e0d-61c6-4cb6-be89-52db6045b586`,
		);
	});

	test('should return the correct output dir', () => {
		const dir = getDir.output(task);
		expect(dir).toEqual(
			`${OUTPUT_DIR}task-5ea68e0d-61c6-4cb6-be89-52db6045b586`,
		);
	});
});
