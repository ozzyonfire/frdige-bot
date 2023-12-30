import OpenAI from "openai";

export const add_ingredient_to_fridge: OpenAI.ChatCompletionCreateParams.Function = {
	name: 'add_ingredient_to_fridge',
	description: 'Adds an ingredient to the fridge',
	parameters: {
		type: 'object',
		properties: {
			ingredient: {
				type: 'string',
				description: 'The ingredient to add to the fridge'
			},
			quantity: {
				type: 'number',
				description: 'The quantity of the ingredient to add to the fridge'
			}
		},
		required: ['ingredient', 'quantity']
	}
}

export const get_fridge_contents: OpenAI.ChatCompletionCreateParams.Function = {
	name: 'get_fridge_contents',
	description: 'Gets the contents of the fridge',
	parameters: {
		type: 'object',
		properties: {},
	}
}

export const edit_fridge_contents: OpenAI.ChatCompletionCreateParams.Function = {
	name: 'edit_fridge_contents',
	description: 'Edits or removes items in the fridge',
	parameters: {
		type: 'object',
		properties: {
			ingredientIndex: {
				type: 'number',
				description: 'The index of the ingredient to edit'
			},
			quantity: {
				type: 'number',
				description: 'The new quantity of the ingredient'
			}
		},
		required: ['ingredientIndex', 'quantity']
	}
}

export const empty_fridge: OpenAI.ChatCompletionCreateParams.Function = {
	name: 'empty_fridge',
	description: 'Removes all items in the fridge',
	parameters: {
		type: 'object',
		properties: {},
	}
}

export const tools = [
	add_ingredient_to_fridge,
	get_fridge_contents,
	edit_fridge_contents,
	empty_fridge
].map(tool => ({
	type: 'function',
	function: tool
})) as OpenAI.ChatCompletionTool[];