import assert from 'node:assert/strict';
import test from 'node:test';
import { parseJsonBody } from './jsonBodyParser.js';
test('parses normal JSON objects', () => {
    assert.deepEqual(parseJsonBody('{"model":"gpt-5","input":"hello"}'), {
        model: 'gpt-5',
        input: 'hello'
    });
});
test('accepts JSON prefixed with a UTF-8 BOM', () => {
    assert.deepEqual(parseJsonBody('\uFEFF{"model":"gpt-5","input":"hello"}'), {
        model: 'gpt-5',
        input: 'hello'
    });
});
test('treats blank request bodies as empty objects', () => {
    assert.deepEqual(parseJsonBody('   \n\t  '), {});
});
//# sourceMappingURL=jsonBodyParser.test.js.map