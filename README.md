# Chat GPT Playground

> Guide for anyone to connect to a paperspace server and access GPT Agent tools


## Setup

Create SSH keys and copy the contents of the file ending in `.pub` 

https://www.howtogeek.com/762863/how-to-generate-ssh-keys-in-windows-10-and-windows-11/

Install Git

https://git-scm.com/download/win

Install Node.js and NPM

https://phoenixnap.com/kb/install-node-js-npm-on-windows

Clone this repo

```bash
git clone https://github.com/pi0neerpat/gpt-playground.git
```

Install 

```
cd gpt-playground
npm i
```

Create a file called `.env` 

```bash
echo PAPERSPACE_API_KEY= > .env
```

Then edit the file with text editor, and paste in the API key after the "=" and save it.

## Usage 

Start the program with 

```
npm start
```

## Resources

- Prompt writing resources https://github.com/f/awesome-chatgpt-prompts
- Desktop App https://github.com/lencx/ChatGPT
- Steamship tool for hosting a chatbot https://www.steamship.com/build?utm_source=github&utm_medium=explainer&utm_campaign=awesome_gpt_prompts&utm_id=awesome_gpt_prompts
