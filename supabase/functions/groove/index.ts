// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1";

const configuration = new Configuration({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const openai = new OpenAIApi(configuration);

serve(async (req) => {
  const prompt =
    "1. For 'genre', Select one of the following genres: dance, funk, pop, rnb or trap. 2. For 'title', give me a three word title for a drum rhythm matching the genre you've selected. 3. For 'description', give me a two line rap about your title without including the words of the title. 4. For 'beat_high' 'beat_med' and 'beat_low', give me a high, mid and low rhythm to match the genre and title. Each is an array of 8 objects, where each object has an 'active' property. The 'active' property value alternates between true and false. Return each answer in one json object.";

  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 300,
  });

  const {
    data: {
      choices: [{ message }],
    },
  } = response;

  return new Response(message?.content, {
    headers: { "Content-Type": "application/json" },
  });
});

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.625_WdcF3KHqz5amU0x2X5WWHP-OEs_4qj0ssLNHzTs' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
