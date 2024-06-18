import express, {Response} from 'express';
import {
  GetMediaObjectResponse,
  GetUserThreadsResponse,
  GetUserThreadsResponseSchema,
  ThreadsMediaMetric,
  ThreadsMediaObject,
  ThreadsUserProfile,
} from '@/types';

const app = express();

const port = process.argv[2] || 9000;

function pickFields<T extends object>(
  obj: T,
  fields: string[] | undefined,
): Partial<T> {
  // TODO: verify if not specifying fields should return all fields
  if (!fields) return obj;
  const newObj: Partial<T> = {};
  fields.forEach((field) => {
    newObj[field as keyof T] = obj[field as keyof T];
  });
  return newObj;
}

const users: Record<string, ThreadsUserProfile> = {
  '1': {
    id: '1',
    username: 'threadsapitestuser',
    threads_profile_picture_url:
      'https://mighty.tools/mockmind-api/content/human/1.jpg',
    threads_biography: 'This is my Threads bio!',
  },
  '2': {
    id: '2',
    username: 'resutsetipasdaerht',
    threads_profile_picture_url:
      'https://mighty.tools/mockmind-api/content/human/2.jpg',
    threads_biography: 'hello world',
  },
};

const threads: Record<string, ThreadsMediaObject> = {
  '1': {
    id: '1',
    media_type: 'TEXT_POST',
    media_product_type: 'THREADS',
    text: 'This is a thread!',
    timestamp: new Date().toISOString(),
    owner: '1',
    shortcode: 'C7oq4zuRz2w',
    is_quote_post: false,
  },
  '2': {
    id: '2',
    media_type: 'TEXT_POST',
    media_product_type: 'THREADS',
    text: 'This is another thread!',
    timestamp: new Date().toISOString(),
    owner: '2',
    shortcode: 'C6ee_dSvZtk',
    is_quote_post: false,
  },
};

const accessCodes: Record<string, string> = {};
const accessTokenToUserId: Record<string, string> = {};

function transformThread(thread: ThreadsMediaObject): ThreadsMediaObject {
  return {
    ...thread,
    username: users[thread.owner!]!.username,
  };
}

function apiError(res: Response, message: string) {
  res.status(400).send({
    error: {
      message,
      type: 'OAuthException',
    },
  });
}

app.get('/oauth/authorize', (req, res) => {
  const {client_id, redirect_uri, response_type, scope} = req.query;

  const makeErrorResponse = (msg: string) => `<html>
  <head>
    <title>Mock authorize</title>
  </head>
  <body>
    <span>Error: ${msg}</span>
  </body>
</html>`;

  if (!client_id) {
    return res.status(400).send(makeErrorResponse('client_id is missing.'));
  }
  if (!redirect_uri) {
    return res.status(400).send(makeErrorResponse('redirect_uri is missing.'));
  }
  if (!response_type) {
    return res.status(400).send(makeErrorResponse('response_type is missing.'));
  }
  if (!scope) {
    return res.status(400).send(makeErrorResponse('scope is missing.'));
  }
  if (response_type !== 'code') {
    return res
      .status(400)
      .send(makeErrorResponse('response_type should be set to "code".'));
  }
  if (typeof redirect_uri !== 'string') {
    return res.status(400).send(makeErrorResponse('Invalid redirect_uri'));
  }

  let code = Math.floor(Math.random() * 1_000_000_000_000) + '';
  accessCodes[code] = redirect_uri;

  res.send(`<html>
  <head>
    <title>Mock authorize</title>
  </head>
  <body>
    <div style="margin-bottom: 8px;">
      <span>Authorize app ${client_id} for scopes ${scope}?</span>
    </div>
    <button onclick="window.location.href='${redirect_uri}?code=${code}#'">Authorize</button>
  </body>
</html>`);
});

app.post('/oauth/access_token', (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      error: 'missing body',
    });
  }
  const {client_id, client_secret, grant_type, redirect_uri, code} = req.body;

  if (!client_id) {
    return res.status(400).send({
      error: 'client_id is missing',
    });
  }
  if (!client_secret) {
    return res.status(400).send({
      error: 'client_secret is missing',
    });
  }
  if (!grant_type) {
    return res.status(400).send({
      error: 'grant_type is missing',
    });
  }
  if (!redirect_uri) {
    return res.status(400).send({
      error: 'redirect_uri is missing',
    });
  }
  if (!code) {
    return res.status(400).send({
      error: 'code is missing',
    });
  }
  if (grant_type !== 'authorization_code') {
    return res.status(400).send({
      error: 'grant_type should be set to "authorization_code".',
    });
  }
  const originalRedirectUri = accessCodes[code];
  if (!code) {
    return res.status(400).send({
      error: 'invalid code',
    });
  }
  if (originalRedirectUri !== redirect_uri) {
    return res.status(400).send({
      error:
        'redirect_uri does not match the one provided when the code was created',
    });
  }
  delete accessCodes[code];

  let token = Math.floor(Math.random() * 1_000_000_000_000) + '';
  const userId = '1';
  accessTokenToUserId[token] = userId;

  res.send({
    access_token: token,
    user_id: userId,
  });
});

app.get('/:userId/threads', (req, res) => {
  const {userId} = req.params;
  const {fields: fieldsQuery} = req.query;
  const userThreads: ThreadsMediaObject[] = [];

  const fields = Array.isArray(fieldsQuery)
    ? undefined
    : (fieldsQuery as string | undefined)?.split(',');

  if (!users[userId]) {
    return apiError(res, 'MOCK-SERVER: User not found');
  }

  for (const threadId in threads) {
    if (threads[threadId].owner === userId) {
      userThreads.push(transformThread(threads[threadId]));
    }
  }

  const response: GetUserThreadsResponse = {
    data: userThreads.map((thread) => pickFields(thread, fields)),
    paging: {
      cursors: {},
    },
  };

  res.send(response);
});

app.get('/:mediaId', (req, res) => {
  const {mediaId} = req.params;
  const {fields: fieldsQuery} = req.query;
  const fields = Array.isArray(fieldsQuery)
    ? undefined
    : (fieldsQuery as string | undefined)?.split(',');
  const thread = threads[mediaId];
  if (!thread) {
    return apiError(res, 'MOCK-SERVER: Thread not found');
  }
  const response = pickFields(thread, fields);
  res.send(response);
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
