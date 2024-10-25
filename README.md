# Browser.AI: Run AI Models Locally in Your Browser

Browser.AI enables developers to run AI models directly on users' devices through a browser-based API. This prototype tests the concept of local AI model execution to improve privacy, speed, and offline functionality for web applications. It exists to provide a demo to support a

## Overview
Browser.AI is a browser prototype that provides an API on the `window` object, enabling websites to run AI models locally on the user’s device. This allows for faster, more private, and offline-capable AI interactions.

## Run
- Download and start [Ollama](https://ollama.com/download).
- Download browser
- Have fun

## Features
- **On-device AI models**
    Keep AI computations on your machine, enhancing privacy, security, and speed.
- **API access via window object**
    Interact with models directly using a simple, intuitive API through the `window` object.
- **Chat & Embedding AI models**
    A streamlined interface for integrating chatbots and other AI features.

## Why Use Browser.AI?
- **Privacy:** Your data stays on your device—nothing is sent to external servers.
- **Speed:** AI models run locally, minimizing latency.
- **Offline:** Works even when you’re not connected to the internet.
- **Security:** You have full control over which models run on your machine.
- **Cost Savings:** No server costs.
- **Control:** You choose the models that run locally, giving you power over AI usage.

## How It Works
Browser.AI exposes three key APIs:
1. **Permissions:** `window.ai.permissions`  - Manage permissions for running AI models on your device.
	1. Request permissions: `window.ai.permissions.request({ model: 'name' })`
	2. List enabled models: `window.ai.permissions.models()`
2. **Model:** `window.ai.model`  - Connect to and interact with AI models directly.
	1. Information: `window.ai.model.info({ model: 'name' })`
	2. Connect to session: `window.ai.model.connect({ model: 'name'});`
3. **Session:** - `connect` returns a session object, which makes available methods for `chat` and `embed`
	1. Chat: `session.chat({ messages: [{ role: 'user', content: 'hello' }]});`
	2. Embed `session.embed({ input: 'hello' });`

### Example Usage

**Simple Chat**
```js
if(await window.ai.permissions.request({ model: 'llama3.2', silent: true })) {
	const session = await window.ai.model.connect({ model: 'llama3.2' });
	const response = await session.chat({ messages: [{ role: 'user', content: 'hello' }] })
	console.log(response)
}
```
**Generate Embeddings**
```js
const docsToEmbed = [...]
const embededDocs = [];
if(await window.ai.permissions.request({ model: 'llama3.2', silent: true })) {
	const session = await window.ai.model.connect({ model: 'llama3.2' });
	let i = 0;
	while(i < docsToEmbed.length) {
		const response = await session.embed({ input: doc })
		embededDocs.push(response.embeddings)
		i++;
	}
}
```
**Request user enables model**
```js
const response = await window.ai.permissions.request({ model: 'llama3.2' })
if (response) {
	// write code that accesses model
} else {
	// handle state where user has not yet enabled model.
	// because silent is false by default, they will get a browser
	// dialog asking them if they want to enable.
}
```

## Current Limitations
- The current implementation has chat and embed methods. This functionality will be expanded to handle all common interfaces for models.
- Does not support streaming that this time. Will add support.
- Does not support function calls. Will add support shortly.
- Permissions are on model level. Will add support for domain level model permissions.

## Architecture

### AI API
The API is exposed on the `window` object, providing access to AI models running on the user’s machine. It communicates with the **Device Bridge**, which handles permissions, model management, and returns the output.

### Device Bridge
The Device Bridge manages models on the user’s machine. It can download, enable, or disable models but doesn’t actually run them. In this prototype, we use **Ollama** as the model runtime.
> The Device Bridge is currently tied to Ollama for the sake of this prototype.

### Device (Model Runtime)
This is the actual runtime environment where AI models are executed. For this prototype, Ollama is used to run models on the user’s machine.

### Key Concepts
- **Available**: A model that is present on the user’s machine (or can be downloaded) but is not yet enabled for use.
- **Enabled**: A model that is available and can be accessed by the AI API.
- **Device**: Hardware the browser, and model, is running on.

## FAQs

- **Is this a real browser?**
    Not exactly. It’s a prototype with limited functionality, mainly for experimenting with AI models in a browser-like environment.
- **Why should I use this?**
    If you want to build or test web apps that leverage AI models running locally on users' devices, this is the tool for you!
- **Can I contribute?**
    Absolutely! Feel free to reach out if you’re interested in contributing or collaborating. Link to proposal

### Roadmap
- [ ] Add support for streaming.
- [ ] Add function-calling support for models.
- [ ] Add support for for text completion.
- [ ] Add support (should work now, but not tested) for image generation.
- [ ] Add support for other runtimes (device adapters)
- [ ] Add experimental support for 3rd-party providers

## Development

### Getting Started

To set up the project locally, follow these steps:

1. **Clone the repo:** git clone git@github.com:kenzic/browser.ai.git
2. **Install dependencies:** Make sure you have [Node.js](https://nodejs.org/) 20+ installed, then run: `npm install`
3. **Start the development server:** To run the app in development mode: `npm run start`
4. **Build the app:** To create a production build of the app: `npm run package`

### Contributing

Contributions are welcome! Here’s how you can contribute:

1. **Fork the repository**
2. **Create a new branch** for your feature or bugfix: `git checkout -b feature-name`
3. **Make your changes**, ensuring you follow the project’s code style.
4. **Open a pull request** with a description of your changes.

Feel free to reach out if you have any questions or need help getting started!

## Thank You

This is my first Electron app, and I used [electron-react-boilerplate](https://electron-react-boilerplate.js.org/) to kickstart the project. I was also inspired by the [Electron as Browser](https://github.com/hulufei/electron-as-browser) project. Thanks to everyone who made those tools!
