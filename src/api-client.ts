import {z} from 'zod';
import {
  CreateMediaContainerParams,
  CreateMediaContainerResponse,
  CreateMediaContainerResponseSchema,
  ExchangeAuthenticationCodeResponse,
  ExchangeAuthenticationCodeResponseSchema,
  GetAccountMetricsParams,
  GetAccountMetricsResponse,
  GetAccountMetricsResponseSchema,
  GetConversationParams,
  GetConversationResponse,
  GetConversationResponseSchema,
  GetMediaMetricsParams,
  GetMediaMetricsResponse,
  GetMediaMetricsResponseSchema,
  GetMediaObjectParams,
  GetMediaObjectResponse,
  GetMediaObjectResponseSchema,
  GetRepliesParams,
  GetRepliesResponse,
  GetRepliesResponseSchema,
  GetUserProfileParams,
  GetUserProfileResponse,
  GetUserProfileResponseSchema,
  GetUserThreadsParams,
  GetUserThreadsPublishingLimitParams,
  GetUserThreadsPublishingLimitResponse,
  GetUserThreadsPublishingLimitResponseSchema,
  GetUserThreadsResponse,
  GetUserThreadsResponseSchema,
  ManageReplyParams,
  ManageReplyResponse,
  ManageReplyResponseSchema,
  PublishParams,
  PublishResponse,
  PublishResponseSchema,
} from '@/types';

export class ThreadsPublicApiClient {
  private readonly _baseUrl: string;

  constructor(baseUrl: string = 'https://graph.instagram.com') {
    this._baseUrl = baseUrl;
  }

  _apiUrl(endpoint: string) {
    return this._baseUrl + endpoint;
  }

  async _apiGet<U, V, T extends z.ZodType<V, z.ZodTypeDef, U>>(
    endpoint: string,
    params: Record<string, string | number | boolean | undefined>,
    responseSchema: T,
  ): Promise<V> {
    const filteredParams = Object.keys(params).reduce(
      (acc: Record<string, string>, key) =>
        params[key] === undefined
          ? {...acc}
          : {...acc, [key]: params[key] + ''},
      {},
    );
    const apiUrl =
      this._apiUrl(endpoint) + '?' + new URLSearchParams(filteredParams);
    const response = await fetch(apiUrl, {
      method: 'GET',
    });
    const json = await response.json();
    return responseSchema.parse(json);
  }

  async _apiPost<U, V, T extends z.ZodType<V, z.ZodTypeDef, U>>(
    endpoint: string,
    params: Record<string, string | number | boolean | undefined>,
    responseSchema: T,
  ): Promise<V> {
    const apiUrl = this._apiUrl(endpoint);
    const body = new FormData();
    Object.keys(params).forEach((key) =>
      body.append(key, params[key] as string),
    );
    const response = await fetch(apiUrl, {
      method: 'POST',
      body,
    });
    const json = await response.json();
    return responseSchema.parse(json);
  }

  createAuthorizationUrl(
    clientId: string,
    redirectUri: string,
    scope: string[],
    state?: string,
  ) {
    return (
      this._apiUrl('/oauth/authorize') +
      '?' +
      new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: scope.join(','),
        response_type: 'code',
        ...(state && {state}),
      })
    );
  }

  async exchangeAuthenticationCode(
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    code: string,
  ): Promise<ExchangeAuthenticationCodeResponse> {
    const formData = new FormData();
    formData.append('client_id', clientId);
    formData.append('client_secret', clientSecret);
    formData.append('grant_type', 'authorization_code');
    formData.append('redirect_uri', redirectUri);
    formData.append('code', code);

    const response = await fetch(this._apiUrl('/oauth/access_token'), {
      method: 'POST',
      body: formData,
    });
    const json = await response.json();
    return ExchangeAuthenticationCodeResponseSchema.parse(json);
  }
}

export class ThreadsAuthenticatedApiClient extends ThreadsPublicApiClient {
  private readonly _accessToken: string;
  private readonly _userId: string;

  constructor(
    accessToken: string,
    userId: string,
    baseUrl: string = 'https://graph.instagram.com',
  ) {
    super(baseUrl);

    this._accessToken = accessToken;
    this._userId = userId;
  }

  async _authenticatedGet<U, V, T extends z.ZodType<V, z.ZodTypeDef, U>>(
    endpoint: string,
    params: Record<string, string | number | boolean | undefined>,
    responseSchema: T,
  ): Promise<V> {
    return this._apiGet(
      endpoint,
      {
        ...params,
        access_token: this._accessToken,
      },
      responseSchema,
    );
  }

  async _authenticatedPost<U, V, T extends z.ZodType<V, z.ZodTypeDef, U>>(
    endpoint: string,
    params: Record<string, string | number | boolean | undefined>,
    responseSchema: T,
  ): Promise<V> {
    return this._apiPost(
      endpoint,
      {
        ...params,
        access_token: this._accessToken,
      },
      responseSchema,
    );
  }

  async createMediaContainer(
    params: CreateMediaContainerParams,
  ): Promise<CreateMediaContainerResponse> {
    return this._authenticatedPost(
      '/me/threads',
      {
        media_type: params.mediaType,
        text: params.text,
        reply_control: params.replyControl,
        reply_to_id: params.replyToId,
        ...(params.mediaType === 'IMAGE' && {
          image_url: params.imageUrl,
          is_carousel_item: params.isCarouselItem,
        }),
        ...(params.mediaType === 'VIDEO' && {
          video_url: params.videoUrl,
          is_carousel_item: params.isCarouselItem,
        }),
        ...(params.mediaType === 'CAROUSEL' && {
          children: params.children.join(','),
        }),
      },
      CreateMediaContainerResponseSchema,
    );
  }

  async publish(params: PublishParams): Promise<PublishResponse> {
    return this._authenticatedPost(
      '/me/threads/publish',
      {
        creation_id: params.creationId,
      },
      PublishResponseSchema,
    );
  }

  async getUserThreads(
    params: GetUserThreadsParams,
  ): Promise<GetUserThreadsResponse> {
    const {id, fields, ...restParams} = params;
    return this._authenticatedGet(
      `/${id}/threads`,
      {
        fields: fields?.join(','),
        ...restParams,
      },
      GetUserThreadsResponseSchema,
    );
  }

  async getMediaObject(
    params: GetMediaObjectParams,
  ): Promise<GetMediaObjectResponse> {
    const {id, fields} = params;
    return this._authenticatedGet(
      `/${id}`,
      {
        fields: fields?.join(','),
      },
      GetMediaObjectResponseSchema,
    );
  }

  async getUserProfile(
    params: GetUserProfileParams,
  ): Promise<GetUserProfileResponse> {
    const {id, fields} = params;
    return this._authenticatedGet(
      `/${id}`,
      {
        fields: fields?.join(','),
      },
      GetUserProfileResponseSchema,
    );
  }

  async getUserThreadsPublishingLimit(
    params: GetUserThreadsPublishingLimitParams,
  ): Promise<GetUserThreadsPublishingLimitResponse> {
    const {id, fields} = params;
    return this._authenticatedGet(
      `/${id}/threads_publishing_limit`,
      {
        fields: fields?.join(','),
      },
      GetUserThreadsPublishingLimitResponseSchema,
    );
  }

  async getReplies(params: GetRepliesParams): Promise<GetRepliesResponse> {
    const {id, fields, ...restParams} = params;
    return this._authenticatedGet(
      `/${id}/replies`,
      {
        fields: fields?.join(','),
        ...restParams,
      },
      GetRepliesResponseSchema,
    );
  }

  async getConversation(
    params: GetConversationParams,
  ): Promise<GetConversationResponse> {
    const {id, fields, ...restParams} = params;
    return this._authenticatedGet(
      `/${id}/conversation`,
      {
        fields: fields?.join(','),
        ...restParams,
      },
      GetConversationResponseSchema,
    );
  }

  async manageReply(params: ManageReplyParams): Promise<ManageReplyResponse> {
    const {id, ...restParams} = params;
    return this._authenticatedPost(
      `/${id}/manage_reply`,
      {
        ...restParams,
      },
      ManageReplyResponseSchema,
    );
  }

  async getMediaMetrics(
    params: GetMediaMetricsParams,
  ): Promise<GetMediaMetricsResponse> {
    const {id, metrics, ...restParams} = params;
    return this._authenticatedGet(
      `/${id}/insights`,
      {
        metric: metrics?.join(','),
        ...restParams,
      },
      GetMediaMetricsResponseSchema,
    );
  }

  async getAccountMetrics(
    params: GetAccountMetricsParams,
  ): Promise<GetAccountMetricsResponse> {
    const {id, metrics, ...restParams} = params;
    return this._authenticatedGet(
      `/${id}/threads_insights`,
      {
        metric: metrics?.join(','),
        ...restParams,
      },
      GetAccountMetricsResponseSchema,
    );
  }
}
