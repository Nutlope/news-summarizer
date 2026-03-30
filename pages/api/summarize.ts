import { parse } from "node-html-parser";
import { OpenAIStream } from "../../utils/OpenAIStream";

export const config = {
  runtime: "edge",
};

if (!process.env.TOGETHER_API_KEY) {
  throw new Error("Missing env var from Together AI");
}

export default async function handler(req: Request) {
  const { url } = (await req.json()) as {
    url?: string;
  };

  if (!url) {
    return new Response("No prompt in the request", { status: 500 });
  }

  try {
    const response = await fetch(url, {
      method: "GET",
    });

    const data = await response.text();

    const root = parse(data);
    const body = root.querySelector(".article-content");
    const text = body!.innerText
      .replace(/(\r\n|\n|\r)/gm, "")
      .replace(/(\r\t|\t|\r)/gm, "");

    const messages = [
      {
        role: "user",
        content: `I want you to act like a news article summarizer. I will input text from a news article and your job is to convert it into a useful summary of a few sentences. Do not repeat sentences and make sure all sentences are clear and complete: "${text}"`,
      },
    ];

    const payload = {
      model: "zai-org/GLM-5",
      messages,
      temperature: 0.5,
      top_p: 1,
      max_tokens: 200,
      stream: true,
    };

    const stream = await OpenAIStream(payload);
    return new Response(stream);
  } catch (e: any) {
    console.log({ e });
    return new Response(e, { status: 500 });
  }
}
