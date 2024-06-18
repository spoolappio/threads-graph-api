import {z} from 'zod';

type Without<T, U> = {[P in Exclude<keyof T, keyof U>]?: never};
type XOR<T, U> = T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;

export type CursorPaginationParams = {
  before?: string;
  after?: string;
  limit?: number;
};

export type TemporalRangeParams = {
  since?: string;
  until?: string;
};

export type TemporalPaginationParams = TemporalRangeParams & {
  limit?: number;
};

const makePaginatedResponseSchema = <T>(dataSchema: z.ZodType<T>) =>
  z.object({
    data: z.array(dataSchema),
    paging: z.object({
      cursors: z.object({
        before: z.string().optional(),
        after: z.string().optional(),
      }),
    }),
  });

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
});
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.number().optional(),
    fbtrace_id: z.string().optional(),
    message: z.string().optional(),
    type: z.string().optional(),
  }),
});
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export const ExchangeAuthenticationCodeResponseSchema = z.object({
  access_token: z.string(),
  user_id: z.coerce.string(),
});
export type ExchangeAuthenticationCodeResponse = z.infer<
  typeof ExchangeAuthenticationCodeResponseSchema
>;

export type CreateMediaContainerParams = {
  replyToId?: string;
  replyControl?: 'everyone' | 'accounts_you_follow' | 'mentioned_only';
} & (
  | {
      mediaType: 'TEXT';
      text: string;
    }
  | {
      mediaType: 'IMAGE';
      imageUrl: string;
      isCarouselItem?: boolean;
      text?: string;
    }
  | {
      mediaType: 'VIDEO';
      videoUrl: string;
      isCarouselItem?: boolean;
      text?: string;
    }
  | {
      mediaType: 'CAROUSEL';
      children: string[];
      text?: string;
    }
);
export const CreateMediaContainerResponseSchema = z.object({
  id: z.string(),
});
export type CreateMediaContainerResponse = z.infer<
  typeof CreateMediaContainerResponseSchema
>;

export type PublishParams = {
  creationId: string;
};
export const PublishResponseSchema = z.object({
  id: z.string(),
});
export type PublishResponse = z.infer<typeof PublishResponseSchema>;

export const ThreadsMediaObjectSchema = z.object({
  id: z.string().optional(),
  media_product_type: z.string().optional(),
  media_type: z
    .enum([
      'TEXT_POST',
      'IMAGE',
      'VIDEO',
      'CAROUSEL_ALBUM',
      'AUDIO',
      'REPOST_FACADE',
    ])
    .optional(),
  media_url: z.string().optional(),
  permalink: z.string().optional(),
  owner: z.string().optional(),
  username: z.string().optional(),
  text: z.string().optional(),
  timestamp: z.string().optional(),
  shortcode: z.string().optional(),
  thumbnail_url: z.string().optional(),
  // TODO: check if this is an array of string IDs or an array of media objects
  children: z.array(z.string()).optional(),
  is_quote_post: z.boolean().optional(),
  is_reply: z.boolean().optional(),
  status_code: z.string().optional(),
});
export type ThreadsMediaObject = z.infer<typeof ThreadsMediaObjectSchema>;
export type ThreadsMediaObjectField = keyof ThreadsMediaObject;

export const ThreadsReplySchema = z.object({
  id: z.string().optional(),
  text: z.string().optional(),
  username: z.string().optional(),
  permalink: z.string().optional(),
  timestamp: z.string().optional(),
  media_product_type: z.string().optional(),
  media_type: z
    .enum(['TEXT_POST', 'IMAGE', 'VIDEO', 'CAROUSEL_ALBUM', 'AUDIO'])
    .optional(),
  media_url: z.string().optional(),
  shortcode: z.string().optional(),
  thumbnail_url: z.string().optional(),
  // TODO: check if this is an array of string IDs or an array of media objects
  children: z.array(z.string()).optional(),
  is_quote_post: z.boolean().optional(),
  has_replies: z.boolean().optional(),
  root_post: z.string().optional(),
  replied_to: z.string().optional(),
  is_reply: z.boolean().optional(),
  is_reply_owned_by_me: z.boolean().optional(),
  hide_status: z
    .enum([
      'NOT_HUSHED',
      'UNHUSHED',
      'HIDDEN',
      'COVERED',
      'BLOCKED',
      'RESTRICTED',
    ])
    .optional(),
});
export type ThreadsReply = z.infer<typeof ThreadsReplySchema>;
export type ThreadsReplyField = keyof ThreadsReply;

export type GetUserThreadsParams = {
  id: string;
  fields?: ThreadsMediaObjectField[];
} & XOR<TemporalPaginationParams, CursorPaginationParams>;
export const GetUserThreadsResponseSchema = makePaginatedResponseSchema(
  ThreadsMediaObjectSchema,
);
export type GetUserThreadsResponse = z.infer<
  typeof GetUserThreadsResponseSchema
>;

export type GetMediaObjectParams = {
  id: string;
  fields?: ThreadsMediaObjectField[];
};
export const GetMediaObjectResponseSchema = ThreadsMediaObjectSchema;
export type GetMediaObjectResponse = z.infer<
  typeof GetMediaObjectResponseSchema
>;

export type GetRepliesParams = {
  id: string;
  fields?: ThreadsReplyField[];
  reverse?: boolean;
} & XOR<TemporalPaginationParams, CursorPaginationParams>;
export const GetRepliesResponseSchema =
  makePaginatedResponseSchema(ThreadsReplySchema);
export type GetRepliesResponse = z.infer<typeof GetRepliesResponseSchema>;

export type GetConversationParams = {
  id: string;
  fields?: ThreadsReplyField[];
  reverse?: boolean;
} & XOR<TemporalPaginationParams, CursorPaginationParams>;
export const GetConversationResponseSchema =
  makePaginatedResponseSchema(ThreadsReplySchema);
export type GetConversationResponse = z.infer<
  typeof GetConversationResponseSchema
>;

export type ManageReplyParams = {
  id: string;
  hide: boolean;
};
export const ManageReplyResponseSchema = SuccessResponseSchema;
export type ManageReplyResponse = z.infer<typeof ManageReplyResponseSchema>;

export const ThreadsUserProfileSchema = z.object({
  id: z.string().optional(),
  username: z.string().optional(),
  threads_profile_picture_url: z.string().optional(),
  threads_biography: z.string().optional(),
});
export type ThreadsUserProfile = z.infer<typeof ThreadsUserProfileSchema>;
export type ThreadsUserProfileField = keyof ThreadsUserProfile;

export type GetUserProfileParams = {
  id: string;
  fields?: ThreadsUserProfileField[];
};
export const GetUserProfileResponseSchema = ThreadsUserProfileSchema;
export type GetUserProfileResponse = z.infer<
  typeof GetUserProfileResponseSchema
>;

export const ThreadsPublishingLimitSchema = z.object({
  data: z.array(
    z.object({
      reply_quota_usage: z.number().optional(),
      reply_config: z
        .object({
          quota_total: z.number().optional(),
          quota_duration: z.number().optional(),
        })
        .optional(),
    }),
  ),
});
export type ThreadsPublishingLimit = z.infer<
  typeof ThreadsPublishingLimitSchema
>;
export type ThreadsPublishingLimitField =
  keyof ThreadsPublishingLimit['data'][0];

export type GetUserThreadsPublishingLimitParams = {
  id: string;
  fields?: ThreadsPublishingLimitField[];
};
export const GetUserThreadsPublishingLimitResponseSchema =
  ThreadsPublishingLimitSchema;
export type GetUserThreadsPublishingLimitResponse = z.infer<
  typeof GetUserThreadsPublishingLimitResponseSchema
>;

export const ThreadsMediaMetricSchema = z.enum([
  'views',
  'likes',
  'replies',
  'reposts',
  'quotes',
]);
export type ThreadsMediaMetric = z.infer<typeof ThreadsMediaMetricSchema>;

export const ThreadsMediaMetricValueSchema = z.object({
  name: ThreadsMediaMetricSchema,
  // TODO: figure out literal union type
  period: z.string(),
  values: z.array(
    z.object({
      value: z.number(),
    }),
  ),
  title: z.string(),
  description: z.string(),
  id: z.string(),
});
export type ThreadsMediaMetricValue = z.infer<
  typeof ThreadsMediaMetricValueSchema
>;

export type GetMediaMetricsParams = {
  id: string;
  metrics?: ThreadsMediaMetric[];
} & TemporalRangeParams;
export const GetMediaMetricsResponseSchema = z.object({
  data: z.array(ThreadsMediaMetricValueSchema),
});
export type GetMediaMetricsResponse = z.infer<
  typeof GetMediaMetricsResponseSchema
>;

export const ThreadsAccountMetricSchema = z.enum([
  'views',
  'likes',
  'replies',
  'reposts',
  'quotes',
  'followers_count',
  'follower_demographics',
]);
export type ThreadsAccountMetric = z.infer<typeof ThreadsAccountMetricSchema>;

export const ThreadsAccountMetricValueSchema = z.object({
  name: ThreadsAccountMetricSchema,
  // TODO: figure out literal union type
  period: z.string(),
  // TODO: can we restrict this to be a homogenous array?
  values: z.array(
    z.object({
      value: z.number(),
      end_time: z.string().optional(),
    }),
  ),
  title: z.string(),
  description: z.string(),
  id: z.string(),
});
export type ThreadsAccountMetricValue = z.infer<
  typeof ThreadsAccountMetricValueSchema
>;

export type GetAccountMetricsParams = {
  id: string;
  metrics?: ThreadsAccountMetric[];
} & TemporalRangeParams;
export const GetAccountMetricsResponseSchema = z.object({
  data: z.array(ThreadsAccountMetricValueSchema),
});
export type GetAccountMetricsResponse = z.infer<
  typeof GetAccountMetricsResponseSchema
>;
