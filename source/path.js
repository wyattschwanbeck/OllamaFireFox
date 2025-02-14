const start = async function() {
  const fullPath = await import.meta.resolve("ollama");
  const path = fullPath?.match(/(\/node_modules.*)/)[0];
  console.log(path);
}

// Call start
start();


// import { Ollama } from 'ollama'



// const ollamaLink = new Ollama({ host: 'http://127.0.0.1:11434' });

// async function generateResponse() {
  // const ollama = new Ollama({ host: 'http://127.0.0.1:11434' })
// const response = await ollama.chat({
  // model: 'llama3.2',
  // messages: [{ role: 'user', content: 'Why is the sky blue?' }],
  
// })
// console.log(response.message.content)
// }

// generateResponse();


