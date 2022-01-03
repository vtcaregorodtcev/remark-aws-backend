import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { HttpResponse } from '../helpers/HttpResponse';
import { validate } from '../helpers/validate';
import { BookmarkProvider } from '../providers';
import { bookmarkIdSchema } from '../schemas/bookmarkIdSchema';
import { BOOKMARKS_TABLE_NAME } from '../constants';
import { Logger } from 'helpers/Logger';
import { Bookmark } from 'types/bookmark';

const logger = new Logger('Update Bookmark');

const db = new DynamoDB();
const bookmarksProvider = new BookmarkProvider(db, BOOKMARKS_TABLE_NAME);

export const handler: APIGatewayProxyHandler = async (event) => {
  logger.log('Event', JSON.stringify(event));

  try {
    await validate(bookmarkIdSchema, event.pathParameters);
  } catch (e) {
    logger.err('ValidationFailed', e);
    return HttpResponse.badRequest(e);
  }

  try {
    const bookmarkId = event.pathParameters?.bookmarkId as string;
    logger.log('BookmarkId', bookmarkId);

    const bookmark = JSON.parse(event.body || '{}' as string) as Bookmark;
    logger.log('Bookmark', bookmark);
    
    await bookmarksProvider.updateBookmark({ ...bookmark, Id: bookmarkId });

    return HttpResponse.success(bookmark);
  } catch (e) {
    logger.err('Error', e);
    return HttpResponse.serverError(e);
  }
};
