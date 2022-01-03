import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { HttpResponse } from '../helpers/HttpResponse';
import {Logger} from '../helpers/Logger';
import { BookmarkProvider } from '../providers';
import { BOOKMARKS_TABLE_NAME } from '../constants';
import { Bookmark } from 'types/bookmark';

const logger = new Logger('Create Bookmark');

const db = new DynamoDB();
const bookmarksProvider = new BookmarkProvider(db, BOOKMARKS_TABLE_NAME);

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    logger.log('Event', JSON.stringify(event));

    const bookmark = JSON.parse(event.body || '{}' as string) as Bookmark;
    logger.log('Body', bookmark);

    const result = await bookmarksProvider.createBookmark(bookmark);
    logger.log('ResultId', result.Id);

    return HttpResponse.success(result);
  } catch (e) {
    logger.err('Error', e);
    return HttpResponse.serverError(e);
  }
};
