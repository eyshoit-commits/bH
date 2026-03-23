import { randomUUID } from 'crypto';

import type { ResponsesApiRequest, ResponsesApiResponse } from './CopilotApiGateway.js';

type ChatCompletionMessage = {
	role: 'system' | 'user' | 'assistant';
	content: string;
};

type ChatCompletionResponse = {
	usage?: {
		prompt_tokens?: number;
		completion_tokens?: number;
		total_tokens?: number;
	};
	choices?: Array<{
		message?: {
			content?: string | null;
		};
	}>;
};

export function extractChatCompletionTextContent(content: unknown): string {
	if (typeof content === 'string') {
		return content;
	}

	if (!Array.isArray(content)) {
		return '';
	}

	return content
		.map(part => {
			if (typeof part === 'string') {
				return part;
			}

			if (!part || typeof part !== 'object') {
				return '';
			}

			const entry = part as Record<string, unknown>;
			if (typeof entry.text === 'string') {
				return entry.text;
			}

			if (entry.type === 'text' && typeof entry.content === 'string') {
				return entry.content;
			}

			return '';
		})
		.join('');
}

export function buildResponsesCustomProviderChatPayload(
	payload: ResponsesApiRequest,
	rawModelId: string,
	defaultSystemPrompt?: string
): { model: string; messages: ChatCompletionMessage[] } {
	const messages: ChatCompletionMessage[] = [];

	if (payload.instructions) {
		messages.push({ role: 'system', content: payload.instructions });
	} else if (defaultSystemPrompt?.trim()) {
		messages.push({ role: 'system', content: defaultSystemPrompt.trim() });
	}

	const input = payload.input;
	if (typeof input === 'string') {
		messages.push({ role: 'user', content: input });
	} else if (Array.isArray(input)) {
		for (const item of input) {
			if (typeof item === 'string') {
				messages.push({ role: 'user', content: item });
				continue;
			}

			if (item.type === 'message' || !item.type) {
				messages.push({
					role: item.role === 'assistant' ? 'assistant' : 'user',
					content: typeof item.content === 'string' ? item.content : JSON.stringify(item.content)
				});
			}
		}
	}

	return {
		model: rawModelId,
		messages
	};
}

export function mapChatCompletionToResponsesApiResponse(
	payload: ResponsesApiRequest,
	exposedModel: string,
	response: ChatCompletionResponse,
	createdAt: number = Math.floor(Date.now() / 1000)
): ResponsesApiResponse {
	const text = extractChatCompletionTextContent(response.choices?.[0]?.message?.content ?? '');
	const promptTokens = response.usage?.prompt_tokens ?? 0;
	const completionTokens = response.usage?.completion_tokens ?? 0;
	const totalTokens = response.usage?.total_tokens ?? promptTokens + completionTokens;

	return {
		id: `resp-${randomUUID()}`,
		object: 'response',
		created_at: createdAt,
		completed_at: createdAt,
		model: exposedModel,
		status: 'completed',
		error: null,
		incomplete_details: null,
		instructions: payload.instructions ?? null,
		max_output_tokens: payload.max_output_tokens ?? null,
		output: [
			{
				type: 'message',
				id: `msg-${randomUUID()}`,
				status: 'completed',
				role: 'assistant',
				content: [
					{
						type: 'output_text',
						text,
						annotations: []
					}
				]
			}
		],
		parallel_tool_calls: true,
		previous_response_id: payload.previous_response_id ?? null,
		reasoning: {
			effort: payload.reasoning?.effort ?? null,
			summary: null
		},
		store: payload.store ?? true,
		temperature: payload.temperature ?? 1.0,
		text: {
			format: payload.text?.format ?? { type: 'text' }
		},
		tool_choice: payload.tool_choice ?? 'auto',
		tools: payload.tools ?? [],
		top_p: payload.top_p ?? 1.0,
		truncation: payload.truncation ?? 'disabled',
		usage: {
			input_tokens: promptTokens,
			input_tokens_details: {
				cached_tokens: 0
			},
			output_tokens: completionTokens,
			output_tokens_details: {
				reasoning_tokens: 0
			},
			total_tokens: totalTokens
		},
		user: null,
		metadata: payload.metadata ?? {}
	};
}
