# threads-graph-api
A Javascript library to interface with the official Instagram Threads API

Maintainers: [@tonypeng](https://www.github.com/tonypeng), [@ishaanbuildsthings](https://www.github.com/ishaanbuildsthings)

### ⚠️ Warning!
This is an unstable early preview release. Some endpoints may not work and the API is subject to change. Please submit an issue or a pull request if you encounter any issues.

## Overview

The `threads-graph-api` repository provides a TypeScript client for interacting with the Instagram Threads API. This library simplifies the process of accessing Instagram's public and authenticated endpoints for managing media, retrieving user profiles, metrics, and more.

## Installation

Install the package with your favorite package manager:

```bash
$ yarn add threads-graph-api
```
or
```bash
$ npm install threads-graph-api
```

## Usage
`threads-graph-api` follows the [official Threads API documentation](https://developers.facebook.com/docs/threads/reference) for endpoints and parameters.

### Initializing the Client

There are two types of clients provided by the library:

- `ThreadsPublicApiClient`
- `ThreadsAuthenticatedApiClient`

#### Public API Client

The `ThreadsPublicApiClient` allows access to endpoints that do not require authentication.

```typescript
import {ThreadsPublicApiClient} from 'threads-graph-api';

const baseUrl = 'https://graph.threads.net';

const publicClient = new ThreadsPublicApiClient(
  baseUrl, // optional
);
```

#### Authenticated API Client

The `ThreadsAuthenticatedApiClient` allows access to endpoints that require authentication.

```typescript
import {ThreadsAuthenticatedApiClient} from 'threads-graph-api';

const accessToken = 'your-access-token';
const userId = 'your-user-id';
const baseUrl = 'https://graph.threads.net'; // you can set this to your own server for testing

const authenticatedClient = new ThreadsAuthenticatedApiClient(
  accessToken,
  userId,
  baseUrl, // optional
);
```

### Authentication

#### Creating Authorization URL

To create an authorization URL:

```typescript
const clientId = 'your-client-id';
const redirectUri = 'your-redirect-uri';
const scope = ['threads_basic', ...];
const baseUrl = 'https://www.threads.net'; // you can set this to your own server for testing

const authUrl = publicClient.createAuthorizationUrl(
  clientId,
  redirectUri,
  scope,
  baseUrl, // optional
);
```

#### Exchanging an Authorization Code

To exchange an authorization code for an access token:

```typescript
const clientSecret = 'your-client-secret';
const code = 'auth-code';

const response = await publicClient.exchangeAuthorizationCode(clientId, clientSecret, redirectUri, code);
```

### Authenticated API

#### Creating a media container

To create a media container:

```typescript
const params = {
  mediaType: 'TEXT',
  text: 'Hello, World!',
};

const response = await authenticatedClient.createMediaContainer(params);
```

#### Publishing media

To publish a media container:

```typescript
const params = {
  creationId: 'media-creation-id',
};

const response = await authenticatedClient.publish(params);
```

#### Getting a user's threads

To get user threads:

```typescript
const params = {
  id: 'user-id',
  fields: ['id', 'media_type', 'media_url'],
};

const response = await authenticatedClient.getUserThreads(params);
```

#### Getting a media object

To get a media object:

```typescript
const params = {
  id: 'media-id',
  fields: ['id', 'media_type', 'media_url'],
};

const response = await authenticatedClient.getMediaObject(params);
```

#### Getting a user's profile

To get a user's profile:

```typescript
const params = {
  id: 'user-id',
  fields: ['id', 'username', 'threads_profile_picture_url'],
};

const response = await authenticatedClient.getUserProfile(params);
```

#### Getting a user's threads publishing limit

To get a user's threads publishing limit:

```typescript
const params = {
  id: 'user-id',
  fields: ['reply_quota_usage', 'reply_config'],
};

const response = await authenticatedClient.getUserThreadsPublishingLimit(params);
```

#### Getting thread replies

To get a thread's replies:

```typescript
const params = {
  id: 'media-id',
  fields: ['id', 'text', 'username'],
  reverse: true,
};

const response = await authenticatedClient.getReplies(params);
```

#### Getting a thread conversation

To get a thread's conversation:

```typescript
const params = {
  id: 'conversation-id',
  fields: ['id', 'text', 'username'],
  reverse: true,
};

const response = await authenticatedClient.getConversation(params);
```

#### Managing a reply

To manage a reply:

```typescript
const params = {
  id: 'reply-id',
  hide: true,
};

const response = await authenticatedClient.manageReply(params);
```

#### Getting media metrics

To get media metrics:

```typescript
const params = {
  id: 'media-id',
  metrics: ['views', 'likes'],
};

const response = await authenticatedClient.getMediaMetrics(params);
```

#### Getting account metrics

To get account metrics:

```typescript
const params = {
  id: 'user-id',
  metrics: ['followers_count'],
};

const response = await authenticatedClient.getAccountMetrics(params);
```

## Contributing

Contributions are welcome (and encouraged)! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
