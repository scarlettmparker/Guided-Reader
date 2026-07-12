/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "mutation Login($input: LoginInput!) {\n  gaiaMutations {\n    login(input: $input) {\n      token\n    }\n  }\n}": typeof types.LoginDocument,
    "query propertySet($ownerKey: String!, $name: String!, $entry: String) {\n  gaiaQueries {\n    propertySet(ownerKey: $ownerKey, name: $name, entry: $entry)\n  }\n}": typeof types.PropertySetDocument,
    "mutation addComment($input: CommentInput!) {\n  hadesMutations {\n    addComment(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}": typeof types.AddCommentDocument,
    "mutation archiveText($id: ID!) {\n  hadesMutations {\n    archiveText(id: $id) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}": typeof types.ArchiveTextDocument,
    "mutation createAnnotation($input: AnnotationInput!) {\n  hadesMutations {\n    createAnnotation(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}": typeof types.CreateAnnotationDocument,
    "mutation createSource($name: String!, $url: String!) {\n  hadesMutations {\n    createSource(name: $name, url: $url) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}": typeof types.CreateSourceDocument,
    "mutation createText($input: ReaderTextInput!) {\n  hadesMutations {\n    createText(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}": typeof types.CreateTextDocument,
    "mutation deleteAnnotation($id: ID!) {\n  hadesMutations {\n    deleteAnnotation(id: $id) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}": typeof types.DeleteAnnotationDocument,
    "mutation discordLogin($code: String!, $state: String!) {\n  hadesMutations {\n    discordLogin(code: $code, state: $state) {\n      token\n      accountId\n      readerAccountId\n    }\n  }\n}": typeof types.DiscordLoginDocument,
    "mutation editAnnotation($id: ID!, $body: String!) {\n  hadesMutations {\n    editAnnotation(id: $id, body: $body) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}": typeof types.EditAnnotationDocument,
    "query listAnnotations($textId: ID!, $includeHidden: Boolean) {\n  hadesQueries {\n    annotations(textId: $textId, includeHidden: $includeHidden) {\n      id\n      positionId\n      body\n      status\n      upvotes\n      downvotes\n      netScore\n      position {\n        id\n        textId\n        startOffset\n        endOffset\n      }\n      author {\n        id\n        discordId\n        discordUsername\n        globalName\n        avatar\n        cefrLevel\n        roles {\n          key\n          name\n        }\n      }\n      myVote\n    }\n  }\n}": typeof types.ListAnnotationsDocument,
    "query listComments($annotationId: ID!, $includeHidden: Boolean, $pagination: PaginationInput) {\n  hadesQueries {\n    comments(\n      annotationId: $annotationId\n      includeHidden: $includeHidden\n      pagination: $pagination\n    ) {\n      items {\n        id\n        annotationId\n        parentId\n        body\n        status\n        upvotes\n        downvotes\n        netScore\n        createdAt\n        updatedAt\n      }\n      pageInfo {\n        page\n        size\n        totalPages\n        totalCount\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n}": typeof types.ListCommentsDocument,
    "query listSources {\n  hadesQueries {\n    sources {\n      id\n      name\n      url\n    }\n  }\n}": typeof types.ListSourcesDocument,
    "query listTexts($pagination: PaginationInput) {\n  hadesQueries {\n    texts(pagination: $pagination) {\n      items {\n        id\n        title\n        language\n        level\n        ownerId\n        sourceId\n        status\n      }\n      pageInfo {\n        page\n        size\n        totalPages\n        totalCount\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n}": typeof types.ListTextsDocument,
    "query locateAnnotation($id: ID!) {\n  hadesQueries {\n    annotation(id: $id) {\n      id\n      positionId\n      body\n      status\n      upvotes\n      downvotes\n      netScore\n      createdAt\n      updatedAt\n    }\n  }\n}": typeof types.LocateAnnotationDocument,
    "query locateText($id: ID!) {\n  hadesQueries {\n    text(id: $id) {\n      id\n      title\n      content\n      language\n      level\n      ownerId\n      sourceId\n      status\n      createdAt\n      updatedAt\n    }\n  }\n}": typeof types.LocateTextDocument,
    "query myVote($targetType: ReaderVoteTarget!, $targetId: ID!) {\n  hadesQueries {\n    myVote(targetType: $targetType, targetId: $targetId)\n  }\n}": typeof types.MyVoteDocument,
    "query readerAccount {\n  hadesQueries {\n    readerAccount {\n      id\n      gaiaAccountId\n      discordId\n      discordUsername\n      globalName\n      avatar\n      cefrLevel\n      roles {\n        key\n        name\n        cefrLevel\n      }\n    }\n  }\n}": typeof types.ReaderAccountDocument,
    "mutation removeVote($targetType: ReaderVoteTarget!, $targetId: ID!) {\n  hadesMutations {\n    removeVote(targetType: $targetType, targetId: $targetId) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}": typeof types.RemoveVoteDocument,
    "mutation hadesVote($input: VoteInput!) {\n  hadesMutations {\n    vote(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}": typeof types.HadesVoteDocument,
    "mutation createPost($input: CreatePostInput!) {\n  icarusMutations {\n    createPost(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}": typeof types.CreatePostDocument,
    "mutation createThread($input: CreateThreadInput!) {\n  icarusMutations {\n    createThread(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}": typeof types.CreateThreadDocument,
    "query listPosts($threadId: ID!, $includeHidden: Boolean, $pagination: PaginationInput) {\n  icarusQueries {\n    posts(\n      threadId: $threadId\n      includeHidden: $includeHidden\n      pagination: $pagination\n    ) {\n      items {\n        id\n        threadId\n        parentId\n        body\n        status\n        upvotes\n        downvotes\n        netScore\n        createdAt\n        updatedAt\n      }\n      pageInfo {\n        page\n        size\n        totalPages\n        totalCount\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n}": typeof types.ListPostsDocument,
    "query locateThread($id: ID!) {\n  icarusQueries {\n    thread(id: $id) {\n      id\n      title\n      status\n      remoteObject\n      createdAt\n      updatedAt\n    }\n  }\n}": typeof types.LocateThreadDocument,
    "query threadsFor($remoteObject: String!) {\n  icarusQueries {\n    threadsFor(remoteObject: $remoteObject) {\n      items {\n        id\n        title\n        status\n        remoteObject\n      }\n      pageInfo {\n        page\n        size\n        totalPages\n        totalCount\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n}": typeof types.ThreadsForDocument,
    "mutation icarusVote($input: ForumVoteInput!) {\n  icarusMutations {\n    vote(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}": typeof types.IcarusVoteDocument,
};
const documents: Documents = {
    "mutation Login($input: LoginInput!) {\n  gaiaMutations {\n    login(input: $input) {\n      token\n    }\n  }\n}": types.LoginDocument,
    "query propertySet($ownerKey: String!, $name: String!, $entry: String) {\n  gaiaQueries {\n    propertySet(ownerKey: $ownerKey, name: $name, entry: $entry)\n  }\n}": types.PropertySetDocument,
    "mutation addComment($input: CommentInput!) {\n  hadesMutations {\n    addComment(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}": types.AddCommentDocument,
    "mutation archiveText($id: ID!) {\n  hadesMutations {\n    archiveText(id: $id) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}": types.ArchiveTextDocument,
    "mutation createAnnotation($input: AnnotationInput!) {\n  hadesMutations {\n    createAnnotation(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}": types.CreateAnnotationDocument,
    "mutation createSource($name: String!, $url: String!) {\n  hadesMutations {\n    createSource(name: $name, url: $url) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}": types.CreateSourceDocument,
    "mutation createText($input: ReaderTextInput!) {\n  hadesMutations {\n    createText(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}": types.CreateTextDocument,
    "mutation deleteAnnotation($id: ID!) {\n  hadesMutations {\n    deleteAnnotation(id: $id) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}": types.DeleteAnnotationDocument,
    "mutation discordLogin($code: String!, $state: String!) {\n  hadesMutations {\n    discordLogin(code: $code, state: $state) {\n      token\n      accountId\n      readerAccountId\n    }\n  }\n}": types.DiscordLoginDocument,
    "mutation editAnnotation($id: ID!, $body: String!) {\n  hadesMutations {\n    editAnnotation(id: $id, body: $body) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}": types.EditAnnotationDocument,
    "query listAnnotations($textId: ID!, $includeHidden: Boolean) {\n  hadesQueries {\n    annotations(textId: $textId, includeHidden: $includeHidden) {\n      id\n      positionId\n      body\n      status\n      upvotes\n      downvotes\n      netScore\n      position {\n        id\n        textId\n        startOffset\n        endOffset\n      }\n      author {\n        id\n        discordId\n        discordUsername\n        globalName\n        avatar\n        cefrLevel\n        roles {\n          key\n          name\n        }\n      }\n      myVote\n    }\n  }\n}": types.ListAnnotationsDocument,
    "query listComments($annotationId: ID!, $includeHidden: Boolean, $pagination: PaginationInput) {\n  hadesQueries {\n    comments(\n      annotationId: $annotationId\n      includeHidden: $includeHidden\n      pagination: $pagination\n    ) {\n      items {\n        id\n        annotationId\n        parentId\n        body\n        status\n        upvotes\n        downvotes\n        netScore\n        createdAt\n        updatedAt\n      }\n      pageInfo {\n        page\n        size\n        totalPages\n        totalCount\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n}": types.ListCommentsDocument,
    "query listSources {\n  hadesQueries {\n    sources {\n      id\n      name\n      url\n    }\n  }\n}": types.ListSourcesDocument,
    "query listTexts($pagination: PaginationInput) {\n  hadesQueries {\n    texts(pagination: $pagination) {\n      items {\n        id\n        title\n        language\n        level\n        ownerId\n        sourceId\n        status\n      }\n      pageInfo {\n        page\n        size\n        totalPages\n        totalCount\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n}": types.ListTextsDocument,
    "query locateAnnotation($id: ID!) {\n  hadesQueries {\n    annotation(id: $id) {\n      id\n      positionId\n      body\n      status\n      upvotes\n      downvotes\n      netScore\n      createdAt\n      updatedAt\n    }\n  }\n}": types.LocateAnnotationDocument,
    "query locateText($id: ID!) {\n  hadesQueries {\n    text(id: $id) {\n      id\n      title\n      content\n      language\n      level\n      ownerId\n      sourceId\n      status\n      createdAt\n      updatedAt\n    }\n  }\n}": types.LocateTextDocument,
    "query myVote($targetType: ReaderVoteTarget!, $targetId: ID!) {\n  hadesQueries {\n    myVote(targetType: $targetType, targetId: $targetId)\n  }\n}": types.MyVoteDocument,
    "query readerAccount {\n  hadesQueries {\n    readerAccount {\n      id\n      gaiaAccountId\n      discordId\n      discordUsername\n      globalName\n      avatar\n      cefrLevel\n      roles {\n        key\n        name\n        cefrLevel\n      }\n    }\n  }\n}": types.ReaderAccountDocument,
    "mutation removeVote($targetType: ReaderVoteTarget!, $targetId: ID!) {\n  hadesMutations {\n    removeVote(targetType: $targetType, targetId: $targetId) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}": types.RemoveVoteDocument,
    "mutation hadesVote($input: VoteInput!) {\n  hadesMutations {\n    vote(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}": types.HadesVoteDocument,
    "mutation createPost($input: CreatePostInput!) {\n  icarusMutations {\n    createPost(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}": types.CreatePostDocument,
    "mutation createThread($input: CreateThreadInput!) {\n  icarusMutations {\n    createThread(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}": types.CreateThreadDocument,
    "query listPosts($threadId: ID!, $includeHidden: Boolean, $pagination: PaginationInput) {\n  icarusQueries {\n    posts(\n      threadId: $threadId\n      includeHidden: $includeHidden\n      pagination: $pagination\n    ) {\n      items {\n        id\n        threadId\n        parentId\n        body\n        status\n        upvotes\n        downvotes\n        netScore\n        createdAt\n        updatedAt\n      }\n      pageInfo {\n        page\n        size\n        totalPages\n        totalCount\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n}": types.ListPostsDocument,
    "query locateThread($id: ID!) {\n  icarusQueries {\n    thread(id: $id) {\n      id\n      title\n      status\n      remoteObject\n      createdAt\n      updatedAt\n    }\n  }\n}": types.LocateThreadDocument,
    "query threadsFor($remoteObject: String!) {\n  icarusQueries {\n    threadsFor(remoteObject: $remoteObject) {\n      items {\n        id\n        title\n        status\n        remoteObject\n      }\n      pageInfo {\n        page\n        size\n        totalPages\n        totalCount\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n}": types.ThreadsForDocument,
    "mutation icarusVote($input: ForumVoteInput!) {\n  icarusMutations {\n    vote(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}": types.IcarusVoteDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation Login($input: LoginInput!) {\n  gaiaMutations {\n    login(input: $input) {\n      token\n    }\n  }\n}"): (typeof documents)["mutation Login($input: LoginInput!) {\n  gaiaMutations {\n    login(input: $input) {\n      token\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query propertySet($ownerKey: String!, $name: String!, $entry: String) {\n  gaiaQueries {\n    propertySet(ownerKey: $ownerKey, name: $name, entry: $entry)\n  }\n}"): (typeof documents)["query propertySet($ownerKey: String!, $name: String!, $entry: String) {\n  gaiaQueries {\n    propertySet(ownerKey: $ownerKey, name: $name, entry: $entry)\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation addComment($input: CommentInput!) {\n  hadesMutations {\n    addComment(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}"): (typeof documents)["mutation addComment($input: CommentInput!) {\n  hadesMutations {\n    addComment(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation archiveText($id: ID!) {\n  hadesMutations {\n    archiveText(id: $id) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}"): (typeof documents)["mutation archiveText($id: ID!) {\n  hadesMutations {\n    archiveText(id: $id) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation createAnnotation($input: AnnotationInput!) {\n  hadesMutations {\n    createAnnotation(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}"): (typeof documents)["mutation createAnnotation($input: AnnotationInput!) {\n  hadesMutations {\n    createAnnotation(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation createSource($name: String!, $url: String!) {\n  hadesMutations {\n    createSource(name: $name, url: $url) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}"): (typeof documents)["mutation createSource($name: String!, $url: String!) {\n  hadesMutations {\n    createSource(name: $name, url: $url) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation createText($input: ReaderTextInput!) {\n  hadesMutations {\n    createText(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}"): (typeof documents)["mutation createText($input: ReaderTextInput!) {\n  hadesMutations {\n    createText(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation deleteAnnotation($id: ID!) {\n  hadesMutations {\n    deleteAnnotation(id: $id) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}"): (typeof documents)["mutation deleteAnnotation($id: ID!) {\n  hadesMutations {\n    deleteAnnotation(id: $id) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation discordLogin($code: String!, $state: String!) {\n  hadesMutations {\n    discordLogin(code: $code, state: $state) {\n      token\n      accountId\n      readerAccountId\n    }\n  }\n}"): (typeof documents)["mutation discordLogin($code: String!, $state: String!) {\n  hadesMutations {\n    discordLogin(code: $code, state: $state) {\n      token\n      accountId\n      readerAccountId\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation editAnnotation($id: ID!, $body: String!) {\n  hadesMutations {\n    editAnnotation(id: $id, body: $body) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}"): (typeof documents)["mutation editAnnotation($id: ID!, $body: String!) {\n  hadesMutations {\n    editAnnotation(id: $id, body: $body) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query listAnnotations($textId: ID!, $includeHidden: Boolean) {\n  hadesQueries {\n    annotations(textId: $textId, includeHidden: $includeHidden) {\n      id\n      positionId\n      body\n      status\n      upvotes\n      downvotes\n      netScore\n      position {\n        id\n        textId\n        startOffset\n        endOffset\n      }\n      author {\n        id\n        discordId\n        discordUsername\n        globalName\n        avatar\n        cefrLevel\n        roles {\n          key\n          name\n        }\n      }\n      myVote\n    }\n  }\n}"): (typeof documents)["query listAnnotations($textId: ID!, $includeHidden: Boolean) {\n  hadesQueries {\n    annotations(textId: $textId, includeHidden: $includeHidden) {\n      id\n      positionId\n      body\n      status\n      upvotes\n      downvotes\n      netScore\n      position {\n        id\n        textId\n        startOffset\n        endOffset\n      }\n      author {\n        id\n        discordId\n        discordUsername\n        globalName\n        avatar\n        cefrLevel\n        roles {\n          key\n          name\n        }\n      }\n      myVote\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query listComments($annotationId: ID!, $includeHidden: Boolean, $pagination: PaginationInput) {\n  hadesQueries {\n    comments(\n      annotationId: $annotationId\n      includeHidden: $includeHidden\n      pagination: $pagination\n    ) {\n      items {\n        id\n        annotationId\n        parentId\n        body\n        status\n        upvotes\n        downvotes\n        netScore\n        createdAt\n        updatedAt\n      }\n      pageInfo {\n        page\n        size\n        totalPages\n        totalCount\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n}"): (typeof documents)["query listComments($annotationId: ID!, $includeHidden: Boolean, $pagination: PaginationInput) {\n  hadesQueries {\n    comments(\n      annotationId: $annotationId\n      includeHidden: $includeHidden\n      pagination: $pagination\n    ) {\n      items {\n        id\n        annotationId\n        parentId\n        body\n        status\n        upvotes\n        downvotes\n        netScore\n        createdAt\n        updatedAt\n      }\n      pageInfo {\n        page\n        size\n        totalPages\n        totalCount\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query listSources {\n  hadesQueries {\n    sources {\n      id\n      name\n      url\n    }\n  }\n}"): (typeof documents)["query listSources {\n  hadesQueries {\n    sources {\n      id\n      name\n      url\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query listTexts($pagination: PaginationInput) {\n  hadesQueries {\n    texts(pagination: $pagination) {\n      items {\n        id\n        title\n        language\n        level\n        ownerId\n        sourceId\n        status\n      }\n      pageInfo {\n        page\n        size\n        totalPages\n        totalCount\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n}"): (typeof documents)["query listTexts($pagination: PaginationInput) {\n  hadesQueries {\n    texts(pagination: $pagination) {\n      items {\n        id\n        title\n        language\n        level\n        ownerId\n        sourceId\n        status\n      }\n      pageInfo {\n        page\n        size\n        totalPages\n        totalCount\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query locateAnnotation($id: ID!) {\n  hadesQueries {\n    annotation(id: $id) {\n      id\n      positionId\n      body\n      status\n      upvotes\n      downvotes\n      netScore\n      createdAt\n      updatedAt\n    }\n  }\n}"): (typeof documents)["query locateAnnotation($id: ID!) {\n  hadesQueries {\n    annotation(id: $id) {\n      id\n      positionId\n      body\n      status\n      upvotes\n      downvotes\n      netScore\n      createdAt\n      updatedAt\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query locateText($id: ID!) {\n  hadesQueries {\n    text(id: $id) {\n      id\n      title\n      content\n      language\n      level\n      ownerId\n      sourceId\n      status\n      createdAt\n      updatedAt\n    }\n  }\n}"): (typeof documents)["query locateText($id: ID!) {\n  hadesQueries {\n    text(id: $id) {\n      id\n      title\n      content\n      language\n      level\n      ownerId\n      sourceId\n      status\n      createdAt\n      updatedAt\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query myVote($targetType: ReaderVoteTarget!, $targetId: ID!) {\n  hadesQueries {\n    myVote(targetType: $targetType, targetId: $targetId)\n  }\n}"): (typeof documents)["query myVote($targetType: ReaderVoteTarget!, $targetId: ID!) {\n  hadesQueries {\n    myVote(targetType: $targetType, targetId: $targetId)\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query readerAccount {\n  hadesQueries {\n    readerAccount {\n      id\n      gaiaAccountId\n      discordId\n      discordUsername\n      globalName\n      avatar\n      cefrLevel\n      roles {\n        key\n        name\n        cefrLevel\n      }\n    }\n  }\n}"): (typeof documents)["query readerAccount {\n  hadesQueries {\n    readerAccount {\n      id\n      gaiaAccountId\n      discordId\n      discordUsername\n      globalName\n      avatar\n      cefrLevel\n      roles {\n        key\n        name\n        cefrLevel\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation removeVote($targetType: ReaderVoteTarget!, $targetId: ID!) {\n  hadesMutations {\n    removeVote(targetType: $targetType, targetId: $targetId) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}"): (typeof documents)["mutation removeVote($targetType: ReaderVoteTarget!, $targetId: ID!) {\n  hadesMutations {\n    removeVote(targetType: $targetType, targetId: $targetId) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation hadesVote($input: VoteInput!) {\n  hadesMutations {\n    vote(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}"): (typeof documents)["mutation hadesVote($input: VoteInput!) {\n  hadesMutations {\n    vote(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation createPost($input: CreatePostInput!) {\n  icarusMutations {\n    createPost(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}"): (typeof documents)["mutation createPost($input: CreatePostInput!) {\n  icarusMutations {\n    createPost(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation createThread($input: CreateThreadInput!) {\n  icarusMutations {\n    createThread(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}"): (typeof documents)["mutation createThread($input: CreateThreadInput!) {\n  icarusMutations {\n    createThread(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query listPosts($threadId: ID!, $includeHidden: Boolean, $pagination: PaginationInput) {\n  icarusQueries {\n    posts(\n      threadId: $threadId\n      includeHidden: $includeHidden\n      pagination: $pagination\n    ) {\n      items {\n        id\n        threadId\n        parentId\n        body\n        status\n        upvotes\n        downvotes\n        netScore\n        createdAt\n        updatedAt\n      }\n      pageInfo {\n        page\n        size\n        totalPages\n        totalCount\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n}"): (typeof documents)["query listPosts($threadId: ID!, $includeHidden: Boolean, $pagination: PaginationInput) {\n  icarusQueries {\n    posts(\n      threadId: $threadId\n      includeHidden: $includeHidden\n      pagination: $pagination\n    ) {\n      items {\n        id\n        threadId\n        parentId\n        body\n        status\n        upvotes\n        downvotes\n        netScore\n        createdAt\n        updatedAt\n      }\n      pageInfo {\n        page\n        size\n        totalPages\n        totalCount\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query locateThread($id: ID!) {\n  icarusQueries {\n    thread(id: $id) {\n      id\n      title\n      status\n      remoteObject\n      createdAt\n      updatedAt\n    }\n  }\n}"): (typeof documents)["query locateThread($id: ID!) {\n  icarusQueries {\n    thread(id: $id) {\n      id\n      title\n      status\n      remoteObject\n      createdAt\n      updatedAt\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query threadsFor($remoteObject: String!) {\n  icarusQueries {\n    threadsFor(remoteObject: $remoteObject) {\n      items {\n        id\n        title\n        status\n        remoteObject\n      }\n      pageInfo {\n        page\n        size\n        totalPages\n        totalCount\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n}"): (typeof documents)["query threadsFor($remoteObject: String!) {\n  icarusQueries {\n    threadsFor(remoteObject: $remoteObject) {\n      items {\n        id\n        title\n        status\n        remoteObject\n      }\n      pageInfo {\n        page\n        size\n        totalPages\n        totalCount\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation icarusVote($input: ForumVoteInput!) {\n  icarusMutations {\n    vote(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}"): (typeof documents)["mutation icarusVote($input: ForumVoteInput!) {\n  icarusMutations {\n    vote(input: $input) {\n      ... on QuerySuccess {\n        __typename\n        message\n        id\n      }\n      ... on StandardError {\n        __typename\n        message\n      }\n    }\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;