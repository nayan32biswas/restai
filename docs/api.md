<!-- markdownlint-disable MD024 -->
# API Endpoints

- [API Endpoints](#api-endpoints)
  - [Create an user](#create-an-user)
  - [Get an user](#get-an-user)
  - [Generate an user's API key](#generate-an-users-api-key)
  - [Get user list](#get-user-list)
  - [Get an LLM](#get-an-llm)
  - [Get all LLMs](#get-all-llms)
  - [Generate a completion](#generate-a-completion)

## Create an user

```shell
POST /users
```

### Parameters

- `username`: (required) username for the new user
- `password`: (required) password for the new user
- `is_admin`: (optional) boolean to specify if the user is an admin
- `is_private`: (optional) boolean to specify if the user is locked to local/private LLMs only

### Response

- `username`: user question
- `is_admin`: answer
- `is_private`: array with sources used to generate the answer

## Get an user

```shell
GET /users/{username}
```

### Parameters

- `username`: (required) username

### Response

- `username`: user question
- `is_admin`: answer
- `is_private`: array with sources used to generate the answer
- `projects`: array with projects the user has access to

## Generate an user's API key

```shell
POST /users/{username}/apikey
```

### Parameters

- `username`: (required) username

### Response

- `api_key`: user's API key, keep it safe if lost new one will need to be generated

## Get user list

```shell
GET /users
```

### Response

- `users`: array with all users, follow the same structure as [Get an user](#get-an-user)

## Get an LLM

```shell
GET /llms/{llmname}
```

### Parameters

- `llmname`: (required) LLM name

### Response

- `name`: LLM Name
- `class_name`: Class name
- `options`: String containing the options used to initialize the LLM
- `privacy`: public or private (local)
- `description`: Description
- `type`: qa, chat, vision

## Get all LLMs

```shell
GET /llms
```

### Response

- `llms`: array with all LLMs, follow the same structure as [Get an LLM](#get-an-llm)

## Generate a completion

```shell
POST /question
```

### Parameters

- `question`: (required) user message
- `system`: (optional) system message, if not provided project's system message will be used
- `stream`: (optional) boolean to specify if this completion is streamed
  
Advanced parameters (optional):

- `score`: (optional) cutoff score, if not provided project's cutoff score will be used [RAG]
- `k`: (optional) k value, if not provided project's k value will be used [RAG]
- `colbert_rerank`: (optional) boolean to specify if colbert reranking is enabled [RAG]
- `llm_rerank`: (optional) boolean to specify if llm reranking is enabled [RAG]
- `eval`: (optional) rag evaluation [RAG]
- `tables`: (optional) tables to be used in the question [RAGSQL]
- `negative`: (optional) negative prompt [VISION]
- `image`: (optional) image [VISION]
- `boost`: (optional) enrich user prompt via LLM [VISION]

### Response

- `question`: user question
- `answer`: answer
- `sources`: array with sources used to generate the answer
- `type`: type (inference, rag, vision, ragsql, etc)
- `tokens.input`: number of tokens used in the question
- `tokens.output`: number of tokens used in the answer
- `image`: image [VISION] [ROUTER]
- `evaluation.reason`: if eval was provided, the reason for the score [RAG]
- `evaluation.score`: if eval was provided, the score [RAG]