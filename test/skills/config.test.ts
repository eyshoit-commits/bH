import assert from 'node:assert/strict';
import test from 'node:test';

import {
	DEFAULT_SKILL_PATH,
	resolveSkillPath,
	setSkillConfigHostForTests
} from '../../src/skills/config.ts';

test.afterEach(() => {
	setSkillConfigHostForTests(undefined);
});

test('resolveSkillPath returns the default path when config is unset', () => {
	setSkillConfigHostForTests({
		workspace: {
			getConfiguration(section) {
				assert.equal(section, 'githubCopilotApi.skills');
				return {
					get<T>(_key: string, defaultValue: T): T {
						return defaultValue;
					}
				};
			}
		}
	});

	assert.equal(resolveSkillPath(), DEFAULT_SKILL_PATH);
});

test('resolveSkillPath prefers an explicit skills.path override', () => {
	setSkillConfigHostForTests({
		workspace: {
			getConfiguration() {
				return {
					get<T>(_key: string, defaultValue: T): T {
						return ('.custom/skills' ?? defaultValue) as T;
					}
				};
			}
		}
	});

	assert.equal(resolveSkillPath(), '.custom/skills');
});
