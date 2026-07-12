/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Date: { input: any; output: any };
  JSON: { input: any; output: any };
};

export type AnnotationInput = {
  body: Scalars["String"]["input"];
  endOffset: Scalars["Int"]["input"];
  startOffset: Scalars["Int"]["input"];
  textId: Scalars["ID"]["input"];
};

export type AuthResult = {
  __typename?: "AuthResult";
  accountId: Scalars["ID"]["output"];
  personId: Scalars["ID"]["output"];
  token: Scalars["String"]["output"];
};

export enum CefrLevel {
  A1 = "A1",
  A2 = "A2",
  B1 = "B1",
  B2 = "B2",
  C1 = "C1",
  C2 = "C2",
}

export type CommentInput = {
  annotationId: Scalars["ID"]["input"];
  body: Scalars["String"]["input"];
  parentId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type CreatePostInput = {
  body: Scalars["String"]["input"];
  parentId?: InputMaybe<Scalars["ID"]["input"]>;
  threadId: Scalars["ID"]["input"];
};

export type CreateThreadInput = {
  remoteObject: Scalars["String"]["input"];
  title: Scalars["String"]["input"];
};

export type DiscordLoginResult = {
  __typename?: "DiscordLoginResult";
  accountId: Scalars["ID"]["output"];
  readerAccountId: Scalars["ID"]["output"];
  token: Scalars["String"]["output"];
};

/** A single filter applied to a paginated query. */
export type FilterInput = {
  field: Scalars["String"]["input"];
  operator: FilterOperator;
  value: Scalars["String"]["input"];
};

/** Operators for FilterInput. */
export enum FilterOperator {
  EndsWith = "ENDS_WITH",
  Equals = "EQUALS",
  GreaterThan = "GREATER_THAN",
  GreaterThanOrEqual = "GREATER_THAN_OR_EQUAL",
  In = "IN",
  LessThan = "LESS_THAN",
  LessThanOrEqual = "LESS_THAN_OR_EQUAL",
  Matches = "MATCHES",
  NotEquals = "NOT_EQUALS",
  StartsWith = "STARTS_WITH",
}

export type ForumObjectReference = {
  __typename?: "ForumObjectReference";
  id: Scalars["ID"]["output"];
  ownerId: Scalars["ID"]["output"];
  ownerType: Scalars["String"]["output"];
};

export type ForumPost = {
  __typename?: "ForumPost";
  body: Scalars["String"]["output"];
  createdAt?: Maybe<Scalars["Date"]["output"]>;
  downvotes: Scalars["Int"]["output"];
  id: Scalars["String"]["output"];
  netScore: Scalars["Int"]["output"];
  parentId?: Maybe<Scalars["ID"]["output"]>;
  status: PostStatus;
  threadId: Scalars["ID"]["output"];
  updatedAt?: Maybe<Scalars["Date"]["output"]>;
  upvotes: Scalars["Int"]["output"];
};

export type ForumThread = {
  __typename?: "ForumThread";
  createdAt?: Maybe<Scalars["Date"]["output"]>;
  id: Scalars["String"]["output"];
  remoteObject?: Maybe<Array<Scalars["String"]["output"]>>;
  status: ThreadStatus;
  title: Scalars["String"]["output"];
  updatedAt?: Maybe<Scalars["Date"]["output"]>;
};

export type ForumVoteInput = {
  postId: Scalars["ID"]["input"];
  value: VoteValue;
};

export type GaiaMutations = {
  __typename?: "GaiaMutations";
  login?: Maybe<AuthResult>;
};

export type GaiaMutationsLoginArgs = {
  input: LoginInput;
};

export type GaiaQueries = {
  __typename?: "GaiaQueries";
  propertySet?: Maybe<Scalars["JSON"]["output"]>;
};

export type GaiaQueriesPropertySetArgs = {
  entry?: InputMaybe<Scalars["String"]["input"]>;
  name: Scalars["String"]["input"];
  ownerKey: Scalars["String"]["input"];
};

export type HadesMutations = {
  __typename?: "HadesMutations";
  addComment?: Maybe<QueryResult>;
  archiveText?: Maybe<QueryResult>;
  attachObject?: Maybe<QueryResult>;
  createAnnotation?: Maybe<QueryResult>;
  createSource?: Maybe<QueryResult>;
  createText?: Maybe<QueryResult>;
  deleteAnnotation?: Maybe<QueryResult>;
  deleteComment?: Maybe<QueryResult>;
  discordLogin?: Maybe<DiscordLoginResult>;
  editAnnotation?: Maybe<QueryResult>;
  editComment?: Maybe<QueryResult>;
  removeVote?: Maybe<QueryResult>;
  vote?: Maybe<QueryResult>;
};

export type HadesMutationsAddCommentArgs = {
  input: CommentInput;
};

export type HadesMutationsArchiveTextArgs = {
  id: Scalars["ID"]["input"];
};

export type HadesMutationsAttachObjectArgs = {
  source: Scalars["ID"]["input"];
  target: Scalars["String"]["input"];
};

export type HadesMutationsCreateAnnotationArgs = {
  input: AnnotationInput;
};

export type HadesMutationsCreateSourceArgs = {
  name: Scalars["String"]["input"];
  url: Scalars["String"]["input"];
};

export type HadesMutationsCreateTextArgs = {
  input: ReaderTextInput;
};

export type HadesMutationsDeleteAnnotationArgs = {
  id: Scalars["ID"]["input"];
};

export type HadesMutationsDeleteCommentArgs = {
  id: Scalars["ID"]["input"];
};

export type HadesMutationsDiscordLoginArgs = {
  code: Scalars["String"]["input"];
  state: Scalars["String"]["input"];
};

export type HadesMutationsEditAnnotationArgs = {
  body: Scalars["String"]["input"];
  id: Scalars["ID"]["input"];
};

export type HadesMutationsEditCommentArgs = {
  body: Scalars["String"]["input"];
  id: Scalars["ID"]["input"];
};

export type HadesMutationsRemoveVoteArgs = {
  targetId: Scalars["ID"]["input"];
  targetType: ReaderVoteTarget;
};

export type HadesMutationsVoteArgs = {
  input: VoteInput;
};

export type HadesQueries = {
  __typename?: "HadesQueries";
  annotation?: Maybe<ReaderAnnotation>;
  annotations: Array<ReaderAnnotation>;
  comments: PagedReaderComments;
  locateRemoteObjects: Array<ReaderObjectReference>;
  myVote?: Maybe<VoteValue>;
  readerAccount?: Maybe<ReaderAccount>;
  source?: Maybe<ReaderSource>;
  sources?: Maybe<Array<ReaderSource>>;
  text?: Maybe<ReaderText>;
  texts: PagedReaderTexts;
};

export type HadesQueriesAnnotationArgs = {
  id: Scalars["ID"]["input"];
};

export type HadesQueriesAnnotationsArgs = {
  includeHidden?: InputMaybe<Scalars["Boolean"]["input"]>;
  textId: Scalars["ID"]["input"];
};

export type HadesQueriesCommentsArgs = {
  annotationId: Scalars["ID"]["input"];
  includeHidden?: InputMaybe<Scalars["Boolean"]["input"]>;
  pagination?: InputMaybe<PaginationInput>;
};

export type HadesQueriesLocateRemoteObjectsArgs = {
  ids: Array<Scalars["String"]["input"]>;
};

export type HadesQueriesMyVoteArgs = {
  targetId: Scalars["ID"]["input"];
  targetType: ReaderVoteTarget;
};

export type HadesQueriesSourceArgs = {
  id: Scalars["ID"]["input"];
};

export type HadesQueriesTextArgs = {
  id: Scalars["ID"]["input"];
};

export type HadesQueriesTextsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};

export type IcarusMutations = {
  __typename?: "IcarusMutations";
  archiveThread?: Maybe<QueryResult>;
  attachObject?: Maybe<QueryResult>;
  createPost?: Maybe<QueryResult>;
  createThread?: Maybe<QueryResult>;
  deletePost?: Maybe<QueryResult>;
  editPost?: Maybe<QueryResult>;
  lockThread?: Maybe<QueryResult>;
  removeVote?: Maybe<QueryResult>;
  vote?: Maybe<QueryResult>;
};

export type IcarusMutationsArchiveThreadArgs = {
  id: Scalars["ID"]["input"];
};

export type IcarusMutationsAttachObjectArgs = {
  source: Scalars["ID"]["input"];
  target: Scalars["String"]["input"];
};

export type IcarusMutationsCreatePostArgs = {
  input: CreatePostInput;
};

export type IcarusMutationsCreateThreadArgs = {
  input: CreateThreadInput;
};

export type IcarusMutationsDeletePostArgs = {
  id: Scalars["ID"]["input"];
};

export type IcarusMutationsEditPostArgs = {
  body: Scalars["String"]["input"];
  id: Scalars["ID"]["input"];
};

export type IcarusMutationsLockThreadArgs = {
  id: Scalars["ID"]["input"];
};

export type IcarusMutationsRemoveVoteArgs = {
  postId: Scalars["ID"]["input"];
};

export type IcarusMutationsVoteArgs = {
  input: ForumVoteInput;
};

export type IcarusQueries = {
  __typename?: "IcarusQueries";
  locateRemoteObjects: Array<ForumObjectReference>;
  myVote?: Maybe<VoteValue>;
  posts: PagedForumPosts;
  thread?: Maybe<ForumThread>;
  threadsFor: PagedForumThreads;
};

export type IcarusQueriesLocateRemoteObjectsArgs = {
  ids: Array<Scalars["String"]["input"]>;
};

export type IcarusQueriesMyVoteArgs = {
  postId: Scalars["ID"]["input"];
};

export type IcarusQueriesPostsArgs = {
  includeHidden?: InputMaybe<Scalars["Boolean"]["input"]>;
  pagination?: InputMaybe<PaginationInput>;
  threadId: Scalars["ID"]["input"];
};

export type IcarusQueriesThreadArgs = {
  id: Scalars["ID"]["input"];
};

export type IcarusQueriesThreadsForArgs = {
  pagination?: InputMaybe<PaginationInput>;
  remoteObject: Scalars["String"]["input"];
};

export type LoginInput = {
  password: Scalars["String"]["input"];
  username: Scalars["String"]["input"];
};

export type Mutation = {
  __typename?: "Mutation";
  gaiaMutations: GaiaMutations;
  hadesMutations: HadesMutations;
  icarusMutations: IcarusMutations;
};

/** Generic page metadata for a paged list. */
export type PageInfo = {
  __typename?: "PageInfo";
  hasNextPage: Scalars["Boolean"]["output"];
  hasPreviousPage: Scalars["Boolean"]["output"];
  page: Scalars["Int"]["output"];
  size: Scalars["Int"]["output"];
  totalCount: Scalars["Int"]["output"];
  totalPages: Scalars["Int"]["output"];
};

export type PagedForumPosts = {
  __typename?: "PagedForumPosts";
  items: Array<ForumPost>;
  pageInfo: PageInfo;
};

export type PagedForumThreads = {
  __typename?: "PagedForumThreads";
  items: Array<ForumThread>;
  pageInfo: PageInfo;
};

export type PagedReaderComments = {
  __typename?: "PagedReaderComments";
  items: Array<ReaderComment>;
  pageInfo: PageInfo;
};

export type PagedReaderTexts = {
  __typename?: "PagedReaderTexts";
  items: Array<ReaderText>;
  pageInfo: PageInfo;
};

/** Generic pagination, sort, and filter input. */
export type PaginationInput = {
  filters?: InputMaybe<Array<FilterInput>>;
  page?: InputMaybe<Scalars["Int"]["input"]>;
  size?: InputMaybe<Scalars["Int"]["input"]>;
  sortBy?: InputMaybe<Scalars["String"]["input"]>;
  sortDir?: InputMaybe<SortDirection>;
};

export enum PostStatus {
  Active = "ACTIVE",
  Deleted = "DELETED",
  Hidden = "HIDDEN",
}

export type Query = {
  __typename?: "Query";
  gaiaQueries: GaiaQueries;
  hadesQueries: HadesQueries;
  icarusQueries: IcarusQueries;
};

export type QueryResult = QuerySuccess | StandardError;

export type QuerySuccess = {
  __typename?: "QuerySuccess";
  id?: Maybe<Scalars["ID"]["output"]>;
  message: Scalars["String"]["output"];
};

export type ReaderAccount = {
  __typename?: "ReaderAccount";
  avatar?: Maybe<Scalars["String"]["output"]>;
  cefrLevel?: Maybe<CefrLevel>;
  discordId: Scalars["String"]["output"];
  discordUsername?: Maybe<Scalars["String"]["output"]>;
  gaiaAccountId: Scalars["ID"]["output"];
  globalName?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["String"]["output"];
  roles: Array<ReaderRole>;
};

export type ReaderAnnotation = {
  __typename?: "ReaderAnnotation";
  author?: Maybe<ReaderAccount>;
  body: Scalars["String"]["output"];
  createdAt?: Maybe<Scalars["Date"]["output"]>;
  downvotes: Scalars["Int"]["output"];
  id: Scalars["String"]["output"];
  myVote?: Maybe<VoteValue>;
  netScore: Scalars["Int"]["output"];
  position?: Maybe<ReaderPosition>;
  positionId: Scalars["ID"]["output"];
  remoteObject?: Maybe<Array<Scalars["String"]["output"]>>;
  status: ReaderStatus;
  updatedAt?: Maybe<Scalars["Date"]["output"]>;
  upvotes: Scalars["Int"]["output"];
};

export type ReaderComment = {
  __typename?: "ReaderComment";
  annotationId: Scalars["ID"]["output"];
  body: Scalars["String"]["output"];
  createdAt?: Maybe<Scalars["Date"]["output"]>;
  downvotes: Scalars["Int"]["output"];
  id: Scalars["String"]["output"];
  netScore: Scalars["Int"]["output"];
  parentId?: Maybe<Scalars["ID"]["output"]>;
  status: ReaderStatus;
  updatedAt?: Maybe<Scalars["Date"]["output"]>;
  upvotes: Scalars["Int"]["output"];
};

export type ReaderObjectReference = {
  __typename?: "ReaderObjectReference";
  id: Scalars["ID"]["output"];
  ownerId: Scalars["ID"]["output"];
  ownerType: Scalars["String"]["output"];
};

export type ReaderPosition = {
  __typename?: "ReaderPosition";
  endOffset: Scalars["Int"]["output"];
  id: Scalars["String"]["output"];
  startOffset: Scalars["Int"]["output"];
  textId: Scalars["ID"]["output"];
};

export type ReaderRole = {
  __typename?: "ReaderRole";
  cefrLevel?: Maybe<CefrLevel>;
  key: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
};

export type ReaderSource = {
  __typename?: "ReaderSource";
  id: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  url: Scalars["String"]["output"];
};

export enum ReaderStatus {
  Active = "ACTIVE",
  Hidden = "HIDDEN",
}

export type ReaderText = {
  __typename?: "ReaderText";
  content: Scalars["String"]["output"];
  createdAt?: Maybe<Scalars["Date"]["output"]>;
  id: Scalars["String"]["output"];
  language: Scalars["String"]["output"];
  level: CefrLevel;
  ownerId?: Maybe<Scalars["ID"]["output"]>;
  sourceId?: Maybe<Scalars["ID"]["output"]>;
  status: ReaderTextStatus;
  title: Scalars["String"]["output"];
  updatedAt?: Maybe<Scalars["Date"]["output"]>;
};

export type ReaderTextInput = {
  content: Scalars["String"]["input"];
  language: Scalars["String"]["input"];
  level: CefrLevel;
  ownerId?: InputMaybe<Scalars["ID"]["input"]>;
  sourceId?: InputMaybe<Scalars["ID"]["input"]>;
  title: Scalars["String"]["input"];
};

export enum ReaderTextStatus {
  Active = "ACTIVE",
  Archived = "ARCHIVED",
}

export enum ReaderVoteTarget {
  Annotation = "ANNOTATION",
  Comment = "COMMENT",
}

export enum SortDirection {
  Asc = "ASC",
  Desc = "DESC",
}

export type StandardError = {
  __typename?: "StandardError";
  message: Scalars["String"]["output"];
};

export enum ThreadStatus {
  Active = "ACTIVE",
  Archived = "ARCHIVED",
  Locked = "LOCKED",
}

export type VoteInput = {
  targetId: Scalars["ID"]["input"];
  targetType: ReaderVoteTarget;
  value: VoteValue;
};

export enum VoteValue {
  Down = "DOWN",
  Up = "UP",
}

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;

export type LoginMutation = {
  __typename?: "Mutation";
  gaiaMutations: {
    __typename?: "GaiaMutations";
    login?: { __typename?: "AuthResult"; token: string } | null;
  };
};

export type PropertySetQueryVariables = Exact<{
  ownerKey: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
  entry?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type PropertySetQuery = {
  __typename?: "Query";
  gaiaQueries: { __typename?: "GaiaQueries"; propertySet?: any | null };
};

export type AddCommentMutationVariables = Exact<{
  input: CommentInput;
}>;

export type AddCommentMutation = {
  __typename?: "Mutation";
  hadesMutations: {
    __typename?: "HadesMutations";
    addComment?:
      | { __typename: "QuerySuccess"; message: string; id?: string | null }
      | { __typename: "StandardError"; message: string }
      | null;
  };
};

export type ArchiveTextMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type ArchiveTextMutation = {
  __typename?: "Mutation";
  hadesMutations: {
    __typename?: "HadesMutations";
    archiveText?:
      | { __typename: "QuerySuccess"; message: string; id?: string | null }
      | { __typename: "StandardError"; message: string }
      | null;
  };
};

export type CreateAnnotationMutationVariables = Exact<{
  input: AnnotationInput;
}>;

export type CreateAnnotationMutation = {
  __typename?: "Mutation";
  hadesMutations: {
    __typename?: "HadesMutations";
    createAnnotation?:
      | { __typename: "QuerySuccess"; message: string; id?: string | null }
      | { __typename: "StandardError"; message: string }
      | null;
  };
};

export type CreateSourceMutationVariables = Exact<{
  name: Scalars["String"]["input"];
  url: Scalars["String"]["input"];
}>;

export type CreateSourceMutation = {
  __typename?: "Mutation";
  hadesMutations: {
    __typename?: "HadesMutations";
    createSource?:
      | { __typename: "QuerySuccess"; message: string; id?: string | null }
      | { __typename: "StandardError"; message: string }
      | null;
  };
};

export type CreateTextMutationVariables = Exact<{
  input: ReaderTextInput;
}>;

export type CreateTextMutation = {
  __typename?: "Mutation";
  hadesMutations: {
    __typename?: "HadesMutations";
    createText?:
      | { __typename: "QuerySuccess"; message: string; id?: string | null }
      | { __typename: "StandardError"; message: string }
      | null;
  };
};

export type DeleteAnnotationMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteAnnotationMutation = {
  __typename?: "Mutation";
  hadesMutations: {
    __typename?: "HadesMutations";
    deleteAnnotation?:
      | { __typename: "QuerySuccess"; message: string; id?: string | null }
      | { __typename: "StandardError"; message: string }
      | null;
  };
};

export type DiscordLoginMutationVariables = Exact<{
  code: Scalars["String"]["input"];
  state: Scalars["String"]["input"];
}>;

export type DiscordLoginMutation = {
  __typename?: "Mutation";
  hadesMutations: {
    __typename?: "HadesMutations";
    discordLogin?: {
      __typename?: "DiscordLoginResult";
      token: string;
      accountId: string;
      readerAccountId: string;
    } | null;
  };
};

export type EditAnnotationMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  body: Scalars["String"]["input"];
}>;

export type EditAnnotationMutation = {
  __typename?: "Mutation";
  hadesMutations: {
    __typename?: "HadesMutations";
    editAnnotation?:
      | { __typename: "QuerySuccess"; message: string; id?: string | null }
      | { __typename: "StandardError"; message: string }
      | null;
  };
};

export type ListAnnotationsQueryVariables = Exact<{
  textId: Scalars["ID"]["input"];
  includeHidden?: InputMaybe<Scalars["Boolean"]["input"]>;
}>;

export type ListAnnotationsQuery = {
  __typename?: "Query";
  hadesQueries: {
    __typename?: "HadesQueries";
    annotations: Array<{
      __typename?: "ReaderAnnotation";
      id: string;
      positionId: string;
      body: string;
      status: ReaderStatus;
      upvotes: number;
      downvotes: number;
      netScore: number;
      myVote?: VoteValue | null;
      position?: {
        __typename?: "ReaderPosition";
        id: string;
        textId: string;
        startOffset: number;
        endOffset: number;
      } | null;
      author?: {
        __typename?: "ReaderAccount";
        id: string;
        discordId: string;
        discordUsername?: string | null;
        globalName?: string | null;
        avatar?: string | null;
        cefrLevel?: CefrLevel | null;
        roles: Array<{ __typename?: "ReaderRole"; key: string; name: string }>;
      } | null;
    }>;
  };
};

export type ListCommentsQueryVariables = Exact<{
  annotationId: Scalars["ID"]["input"];
  includeHidden?: InputMaybe<Scalars["Boolean"]["input"]>;
  pagination?: InputMaybe<PaginationInput>;
}>;

export type ListCommentsQuery = {
  __typename?: "Query";
  hadesQueries: {
    __typename?: "HadesQueries";
    comments: {
      __typename?: "PagedReaderComments";
      items: Array<{
        __typename?: "ReaderComment";
        id: string;
        annotationId: string;
        parentId?: string | null;
        body: string;
        status: ReaderStatus;
        upvotes: number;
        downvotes: number;
        netScore: number;
        createdAt?: any | null;
        updatedAt?: any | null;
      }>;
      pageInfo: {
        __typename?: "PageInfo";
        page: number;
        size: number;
        totalPages: number;
        totalCount: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
    };
  };
};

export type ListSourcesQueryVariables = Exact<{ [key: string]: never }>;

export type ListSourcesQuery = {
  __typename?: "Query";
  hadesQueries: {
    __typename?: "HadesQueries";
    sources?: Array<{
      __typename?: "ReaderSource";
      id: string;
      name: string;
      url: string;
    }> | null;
  };
};

export type ListTextsQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationInput>;
}>;

export type ListTextsQuery = {
  __typename?: "Query";
  hadesQueries: {
    __typename?: "HadesQueries";
    texts: {
      __typename?: "PagedReaderTexts";
      items: Array<{
        __typename?: "ReaderText";
        id: string;
        title: string;
        language: string;
        level: CefrLevel;
        ownerId?: string | null;
        sourceId?: string | null;
        status: ReaderTextStatus;
      }>;
      pageInfo: {
        __typename?: "PageInfo";
        page: number;
        size: number;
        totalPages: number;
        totalCount: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
    };
  };
};

export type LocateAnnotationQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type LocateAnnotationQuery = {
  __typename?: "Query";
  hadesQueries: {
    __typename?: "HadesQueries";
    annotation?: {
      __typename?: "ReaderAnnotation";
      id: string;
      positionId: string;
      body: string;
      status: ReaderStatus;
      upvotes: number;
      downvotes: number;
      netScore: number;
      createdAt?: any | null;
      updatedAt?: any | null;
    } | null;
  };
};

export type LocateTextQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type LocateTextQuery = {
  __typename?: "Query";
  hadesQueries: {
    __typename?: "HadesQueries";
    text?: {
      __typename?: "ReaderText";
      id: string;
      title: string;
      content: string;
      language: string;
      level: CefrLevel;
      ownerId?: string | null;
      sourceId?: string | null;
      status: ReaderTextStatus;
      createdAt?: any | null;
      updatedAt?: any | null;
    } | null;
  };
};

export type MyVoteQueryVariables = Exact<{
  targetType: ReaderVoteTarget;
  targetId: Scalars["ID"]["input"];
}>;

export type MyVoteQuery = {
  __typename?: "Query";
  hadesQueries: { __typename?: "HadesQueries"; myVote?: VoteValue | null };
};

export type ReaderAccountQueryVariables = Exact<{ [key: string]: never }>;

export type ReaderAccountQuery = {
  __typename?: "Query";
  hadesQueries: {
    __typename?: "HadesQueries";
    readerAccount?: {
      __typename?: "ReaderAccount";
      id: string;
      gaiaAccountId: string;
      discordId: string;
      discordUsername?: string | null;
      globalName?: string | null;
      avatar?: string | null;
      cefrLevel?: CefrLevel | null;
      roles: Array<{
        __typename?: "ReaderRole";
        key: string;
        name: string;
        cefrLevel?: CefrLevel | null;
      }>;
    } | null;
  };
};

export type RemoveVoteMutationVariables = Exact<{
  targetType: ReaderVoteTarget;
  targetId: Scalars["ID"]["input"];
}>;

export type RemoveVoteMutation = {
  __typename?: "Mutation";
  hadesMutations: {
    __typename?: "HadesMutations";
    removeVote?:
      | { __typename: "QuerySuccess"; message: string; id?: string | null }
      | { __typename: "StandardError"; message: string }
      | null;
  };
};

export type HadesVoteMutationVariables = Exact<{
  input: VoteInput;
}>;

export type HadesVoteMutation = {
  __typename?: "Mutation";
  hadesMutations: {
    __typename?: "HadesMutations";
    vote?:
      | { __typename: "QuerySuccess"; message: string; id?: string | null }
      | { __typename: "StandardError"; message: string }
      | null;
  };
};

export type CreatePostMutationVariables = Exact<{
  input: CreatePostInput;
}>;

export type CreatePostMutation = {
  __typename?: "Mutation";
  icarusMutations: {
    __typename?: "IcarusMutations";
    createPost?:
      | { __typename: "QuerySuccess"; message: string; id?: string | null }
      | { __typename: "StandardError"; message: string }
      | null;
  };
};

export type CreateThreadMutationVariables = Exact<{
  input: CreateThreadInput;
}>;

export type CreateThreadMutation = {
  __typename?: "Mutation";
  icarusMutations: {
    __typename?: "IcarusMutations";
    createThread?:
      | { __typename: "QuerySuccess"; message: string; id?: string | null }
      | { __typename: "StandardError"; message: string }
      | null;
  };
};

export type ListPostsQueryVariables = Exact<{
  threadId: Scalars["ID"]["input"];
  includeHidden?: InputMaybe<Scalars["Boolean"]["input"]>;
  pagination?: InputMaybe<PaginationInput>;
}>;

export type ListPostsQuery = {
  __typename?: "Query";
  icarusQueries: {
    __typename?: "IcarusQueries";
    posts: {
      __typename?: "PagedForumPosts";
      items: Array<{
        __typename?: "ForumPost";
        id: string;
        threadId: string;
        parentId?: string | null;
        body: string;
        status: PostStatus;
        upvotes: number;
        downvotes: number;
        netScore: number;
        createdAt?: any | null;
        updatedAt?: any | null;
      }>;
      pageInfo: {
        __typename?: "PageInfo";
        page: number;
        size: number;
        totalPages: number;
        totalCount: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
    };
  };
};

export type LocateThreadQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type LocateThreadQuery = {
  __typename?: "Query";
  icarusQueries: {
    __typename?: "IcarusQueries";
    thread?: {
      __typename?: "ForumThread";
      id: string;
      title: string;
      status: ThreadStatus;
      remoteObject?: Array<string> | null;
      createdAt?: any | null;
      updatedAt?: any | null;
    } | null;
  };
};

export type ThreadsForQueryVariables = Exact<{
  remoteObject: Scalars["String"]["input"];
}>;

export type ThreadsForQuery = {
  __typename?: "Query";
  icarusQueries: {
    __typename?: "IcarusQueries";
    threadsFor: {
      __typename?: "PagedForumThreads";
      items: Array<{
        __typename?: "ForumThread";
        id: string;
        title: string;
        status: ThreadStatus;
        remoteObject?: Array<string> | null;
      }>;
      pageInfo: {
        __typename?: "PageInfo";
        page: number;
        size: number;
        totalPages: number;
        totalCount: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
    };
  };
};

export type IcarusVoteMutationVariables = Exact<{
  input: ForumVoteInput;
}>;

export type IcarusVoteMutation = {
  __typename?: "Mutation";
  icarusMutations: {
    __typename?: "IcarusMutations";
    vote?:
      | { __typename: "QuerySuccess"; message: string; id?: string | null }
      | { __typename: "StandardError"; message: string }
      | null;
  };
};

export const LoginDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "Login" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "LoginInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "gaiaMutations" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "login" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "input" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "token" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const PropertySetDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "propertySet" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "ownerKey" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "entry" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "gaiaQueries" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "propertySet" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "ownerKey" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "ownerKey" },
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "name" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "name" },
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "entry" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "entry" },
                      },
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PropertySetQuery, PropertySetQueryVariables>;
export const AddCommentDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "addComment" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CommentInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "hadesMutations" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "addComment" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "input" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "QuerySuccess" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "__typename" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "message" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "StandardError" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "__typename" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "message" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AddCommentMutation, AddCommentMutationVariables>;
export const ArchiveTextDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "archiveText" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "hadesMutations" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "archiveText" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "id" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "id" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "QuerySuccess" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "__typename" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "message" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "StandardError" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "__typename" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "message" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ArchiveTextMutation, ArchiveTextMutationVariables>;
export const CreateAnnotationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "createAnnotation" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "AnnotationInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "hadesMutations" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "createAnnotation" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "input" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "QuerySuccess" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "__typename" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "message" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "StandardError" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "__typename" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "message" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateAnnotationMutation,
  CreateAnnotationMutationVariables
>;
export const CreateSourceDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "createSource" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "url" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "hadesMutations" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "createSource" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "name" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "name" },
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "url" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "url" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "QuerySuccess" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "__typename" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "message" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "StandardError" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "__typename" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "message" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateSourceMutation,
  CreateSourceMutationVariables
>;
export const CreateTextDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "createText" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ReaderTextInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "hadesMutations" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "createText" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "input" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "QuerySuccess" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "__typename" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "message" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "StandardError" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "__typename" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "message" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateTextMutation, CreateTextMutationVariables>;
export const DeleteAnnotationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "deleteAnnotation" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "hadesMutations" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "deleteAnnotation" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "id" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "id" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "QuerySuccess" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "__typename" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "message" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "StandardError" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "__typename" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "message" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteAnnotationMutation,
  DeleteAnnotationMutationVariables
>;
export const DiscordLoginDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "discordLogin" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "code" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "state" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "hadesMutations" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "discordLogin" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "code" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "code" },
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "state" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "state" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "token" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "accountId" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "readerAccountId" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DiscordLoginMutation,
  DiscordLoginMutationVariables
>;
export const EditAnnotationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "editAnnotation" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "body" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "hadesMutations" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "editAnnotation" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "id" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "id" },
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "body" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "body" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "QuerySuccess" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "__typename" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "message" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "StandardError" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "__typename" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "message" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  EditAnnotationMutation,
  EditAnnotationMutationVariables
>;
export const ListAnnotationsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "listAnnotations" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "textId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "includeHidden" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "hadesQueries" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "annotations" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "textId" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "textId" },
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "includeHidden" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "includeHidden" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "positionId" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "body" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "upvotes" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "downvotes" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "netScore" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "position" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "textId" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "startOffset" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "endOffset" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "author" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "discordId" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "discordUsername" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "globalName" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "avatar" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "cefrLevel" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "roles" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "key" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "name" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "myVote" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ListAnnotationsQuery,
  ListAnnotationsQueryVariables
>;
export const ListCommentsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "listComments" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "annotationId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "includeHidden" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "pagination" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "PaginationInput" },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "hadesQueries" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "comments" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "annotationId" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "annotationId" },
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "includeHidden" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "includeHidden" },
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "pagination" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "pagination" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "items" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "annotationId" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "parentId" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "body" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "status" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "upvotes" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "downvotes" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "netScore" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "createdAt" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "updatedAt" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "pageInfo" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "page" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "size" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "totalPages" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "totalCount" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "hasNextPage" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "hasPreviousPage" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ListCommentsQuery, ListCommentsQueryVariables>;
export const ListSourcesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "listSources" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "hadesQueries" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "sources" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "url" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ListSourcesQuery, ListSourcesQueryVariables>;
export const ListTextsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "listTexts" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "pagination" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "PaginationInput" },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "hadesQueries" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "texts" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "pagination" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "pagination" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "items" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "title" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "language" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "level" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "ownerId" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "sourceId" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "status" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "pageInfo" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "page" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "size" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "totalPages" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "totalCount" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "hasNextPage" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "hasPreviousPage" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ListTextsQuery, ListTextsQueryVariables>;
export const LocateAnnotationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "locateAnnotation" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "hadesQueries" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "annotation" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "id" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "id" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "positionId" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "body" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "upvotes" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "downvotes" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "netScore" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "createdAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "updatedAt" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  LocateAnnotationQuery,
  LocateAnnotationQueryVariables
>;
export const LocateTextDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "locateText" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "hadesQueries" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "text" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "id" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "id" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "content" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "language" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "level" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "ownerId" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sourceId" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "createdAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "updatedAt" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LocateTextQuery, LocateTextQueryVariables>;
export const MyVoteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "myVote" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "targetType" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ReaderVoteTarget" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "targetId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "hadesQueries" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "myVote" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "targetType" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "targetType" },
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "targetId" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "targetId" },
                      },
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MyVoteQuery, MyVoteQueryVariables>;
export const ReaderAccountDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "readerAccount" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "hadesQueries" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "readerAccount" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "gaiaAccountId" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "discordId" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "discordUsername" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "globalName" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "avatar" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "cefrLevel" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "roles" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "key" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "name" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "cefrLevel" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ReaderAccountQuery, ReaderAccountQueryVariables>;
export const RemoveVoteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "removeVote" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "targetType" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ReaderVoteTarget" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "targetId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "hadesMutations" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "removeVote" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "targetType" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "targetType" },
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "targetId" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "targetId" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "QuerySuccess" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "__typename" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "message" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "StandardError" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "__typename" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "message" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RemoveVoteMutation, RemoveVoteMutationVariables>;
export const HadesVoteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "hadesVote" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "VoteInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "hadesMutations" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "vote" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "input" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "QuerySuccess" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "__typename" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "message" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "StandardError" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "__typename" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "message" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<HadesVoteMutation, HadesVoteMutationVariables>;
export const CreatePostDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "createPost" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreatePostInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "icarusMutations" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "createPost" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "input" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "QuerySuccess" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "__typename" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "message" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "StandardError" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "__typename" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "message" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreatePostMutation, CreatePostMutationVariables>;
export const CreateThreadDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "createThread" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreateThreadInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "icarusMutations" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "createThread" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "input" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "QuerySuccess" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "__typename" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "message" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "StandardError" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "__typename" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "message" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateThreadMutation,
  CreateThreadMutationVariables
>;
export const ListPostsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "listPosts" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "threadId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "includeHidden" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "pagination" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "PaginationInput" },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "icarusQueries" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "posts" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "threadId" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "threadId" },
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "includeHidden" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "includeHidden" },
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "pagination" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "pagination" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "items" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "threadId" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "parentId" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "body" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "status" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "upvotes" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "downvotes" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "netScore" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "createdAt" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "updatedAt" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "pageInfo" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "page" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "size" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "totalPages" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "totalCount" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "hasNextPage" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "hasPreviousPage" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ListPostsQuery, ListPostsQueryVariables>;
export const LocateThreadDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "locateThread" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "icarusQueries" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "thread" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "id" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "id" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "remoteObject" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "createdAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "updatedAt" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LocateThreadQuery, LocateThreadQueryVariables>;
export const ThreadsForDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "threadsFor" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "remoteObject" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "icarusQueries" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "threadsFor" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "remoteObject" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "remoteObject" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "items" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "title" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "status" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "remoteObject" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "pageInfo" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "page" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "size" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "totalPages" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "totalCount" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "hasNextPage" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "hasPreviousPage" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ThreadsForQuery, ThreadsForQueryVariables>;
export const IcarusVoteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "icarusVote" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ForumVoteInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "icarusMutations" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "vote" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "input" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "input" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "QuerySuccess" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "__typename" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "message" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "StandardError" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "__typename" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "message" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<IcarusVoteMutation, IcarusVoteMutationVariables>;
