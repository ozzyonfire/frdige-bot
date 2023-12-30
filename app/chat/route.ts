import { chatCompletion } from "@/lib/chat/gpt";
import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from "openai";

export const runtime = 'edge';

const post = async (req: Request) => {
	const { messages } = await req.json() as { messages: OpenAI.ChatCompletionMessageParam[] };

	// strip out the createdAt and id fields of the messages
	// const filteredMessages = messages.map(message => {
	// 	const { content, role , name} = message;
	// 	return {
	// 		content,
	// 		role,
	// 		name
	// 	} as OpenAI.ChatCompletionMessage;
	// });

	const response = await chatCompletion(messages);
	const stream = OpenAIStream(response);

	return new StreamingTextResponse(stream);
}

export {
	post as POST
}