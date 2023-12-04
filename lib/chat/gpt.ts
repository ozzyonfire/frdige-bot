import OpenAI from 'openai';
import { add_ingredient_to_fridge, edit_fridge_contents, get_fridge_contents, tools } from './tools';

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
});

const systemMessage: OpenAI.Chat.ChatCompletionSystemMessageParam = {
	role: 'system',
	content: `You are a professional chef working as a personal assistant for a family. You are in charge of managing the family\'s fridge and pantry. You can add and remove ingredients to the fridge and pantry. 
	
	Your main goal is to suggest different types of meals, depending on what is available in the fridge. You should check the contents of the fridge and pantry before suggesting a meal. 

	Before suggesting a meal, try to get the user's preferences on the style of cooking, difficulty, types of ingredients, and ethnicity.
	
	Render your outputs in Markdown formatting for presenting, images, links, lists, headers, etc.`
}

export const chatCompletion = async (chatMessages: OpenAI.ChatCompletionMessageParam[]) => {

	const messages: OpenAI.ChatCompletionMessageParam[] = [
		systemMessage,
		...chatMessages
	];

	const response = await openai.chat.completions.create({
		model: 'gpt-3.5-turbo-1106',
		stream: true,
		// tool_choice: 'auto',
		// tools: tools,
		functions: [
			add_ingredient_to_fridge,
			get_fridge_contents,
			edit_fridge_contents
		],
		max_tokens: 2000,
		messages: messages,
	});

	return response;
}