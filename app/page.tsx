'use client';

import { ChatRequest, CreateMessage, FunctionCallHandler, Message, ToolCall, ToolCallHandler, nanoid } from "ai";
import { useChat } from "ai/react";
import { useMemo, useState } from "react";
import { edit_fridge_contents, tools } from '@/lib/chat/bot';
import { useFridge } from "@/lib/utils";
import Markdown from 'react-markdown';

export default function Home() {

  const getToolsResponse = async (toolCalls: ToolCall[]) => {
    const messagesToSend: Message[] = [];
    for (const toolCall of toolCalls) {
      const { function: toolFn, id, type } = toolCall;
      const functionToCall = tools[toolFn.name as keyof typeof tools];
      if (functionToCall) {
        const args = JSON.parse(toolFn.arguments || '{}');
        const response = await functionToCall(args);
        console.log(response);
        messagesToSend.push({
          id,
          name: toolFn.name,
          role: 'tool',
          content: JSON.stringify(response),
        });
      }
    }
    return messagesToSend;
  }

  const toolCallHandler: ToolCallHandler = async (messages, toolCalls) => {
    const messagesToSend = [...messages];
    messagesToSend.concat(await getToolsResponse(toolCalls));
    const response: ChatRequest = {
      messages: messagesToSend,
    };
    return response;
  }

  const functionCallHandler: FunctionCallHandler = async (messages, functionCall) => {
    console.log(messages, functionCall.name, functionCall.arguments);
    let response: any = {
      status: 'error',
      message: 'Unknown function name'
    }

    const functionToCall = tools[functionCall.name as keyof typeof tools];
    if (functionCall) {
      const args = JSON.parse(functionCall.arguments || '{}');
      response = await functionToCall(args);
    }

    const functionResponse: ChatRequest = {
      messages: [
        ...messages,
        {
          id: nanoid(),
          name: functionCall.name,
          role: 'function',
          content: JSON.stringify(response),
        }
      ]
    };
    return functionResponse;
  }

  const { messages, append, input, handleInputChange, handleSubmit, error, isLoading, stop, setMessages, reload } = useChat({
    api: '/chat',
    onError: (error) => {
      console.error(error);
    },
    experimental_onFunctionCall: functionCallHandler,
    experimental_onToolCall: toolCallHandler,
    // onFinish: async (message) => {
    //   console.log(message);
    //   if (message.tool_calls) {
    //     const toolResponses = await getToolsResponse(message.tool_calls as ToolCall[]);
    //     const newMessages = [...messages, message, ...toolResponses];
    //     console.log('new', newMessages);
    //     setMessages(newMessages);
    //   }
    // },
    sendExtraMessageFields: false
  });

  const fridge = useFridge();

  const handleRemove = async (index: number) => {
    await edit_fridge_contents({
      indredientIndex: index,
      quantity: 0,
    });
  }

  const handleQuantityChange = async (index: number, quantity: number) => {
    await edit_fridge_contents({
      indredientIndex: index,
      quantity,
    });
  }

  const messagesMarkup = useMemo(() => {
    return messages.map((message, i) => (
      <div key={i} className='flex flex-col gap-2 p-2'>
        <div className='flex flex-row gap-2'>
          <span className='font-bold'>{message.role}</span>
          {message.createdAt &&
            <span>{message.createdAt.toLocaleTimeString()}</span>
          }
        </div>
        <Markdown className='markdown'>
          {message.content}
        </Markdown>
      </div>
    ))
  }, [messages]);

  const fridgeMarkup = useMemo(() => {
    return fridge.items.map((item, i) => (
      <div key={i} className='flex justify-between items-center p-3 hover:bg-gray-50 transition-all duration-300 ease-in-out transform hover:scale-105'>
        <span className='text-lg font-medium text-gray-800'>{item.ingredient}</span>
        <div className='flex items-center'>
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) => handleQuantityChange(i, parseInt(e.target.value, 10))}
            className='mr-4 w-16 text-center border rounded-md border-sky-700 p-1'
          />
          <button
            onClick={() => handleRemove(i)}
            className='text-red-500 hover:text-red-700 transition-colors ease-in-out duration-300'
          >
            Remove
          </button>
        </div>
      </div>
    ));
  }, [fridge]);

  return (
    <main className="flex h-screen p-12 bg-sky-700 gap-12">
      <div className='flex flex-col w-full md:w-2/3 lg:w-1/3 bg-white rounded-lg shadow-lg divide-y divide-gray-200 overflow-hidden'>
        <div className="flex flex-row gap-4 p-4 items-center">
          <h1 className='text-4xl font-bold border-b border-gray-200'>My Fridge</h1>
          <div className='flex-grow'></div>
          <button
            onClick={() => reload()}
            className='bg-sky-700 hover:bg-sky-600 text-white rounded-lg p-2'
          >
            Clear all
          </button>
        </div>
        <div className='flex flex-col gap-2 p-4 h-full overflow-y-auto'>
          {fridgeMarkup}
        </div>
      </div>
      <div className='flex flex-col w-2/3 bg-white rounded-lg p-4'>
        <div className="flex flex-row gap-4 items-center">
          <h1 className='text-4xl font-bold'>Fridge Bot</h1>
          {isLoading && <span>Loading...</span>}
        </div>
        <div id="messages" className='flex flex-col flex-grow rounded-lg border-sky-700 overflow-y-auto'>
          {messagesMarkup}
        </div>
        <form onSubmit={handleSubmit}>
          <div className='flex gap-4'>
            <input
              className='w-full border border-sky-700 rounded-lg p-2'
              // rows={1}
              name="message"
              value={input}
              onChange={handleInputChange}
            />
            <button
              className='bg-sky-700 hover:bg-sky-600 text-white rounded-lg p-2'
              type='submit'
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
