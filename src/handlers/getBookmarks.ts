import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { HttpResponse } from '../helpers/HttpResponse';
import { BookmarkProvider } from '../providers';
import { BOOKMARKS_TABLE_NAME } from '../constants';
import { Logger } from 'helpers/Logger';

const logger = new Logger('Get Bookmarks');

const db = new DynamoDB();
const bookmarksProvider = new BookmarkProvider(db, BOOKMARKS_TABLE_NAME);

export const handler: APIGatewayProxyHandler = async (event) => {
  logger.log('Event', JSON.stringify(event));

  try {
    const items = await bookmarksProvider.scanBookmarks();
    logger.log('Bookmarks', items);

    return HttpResponse.success({ data: items });
  } catch (e) {
    logger.err('Error', e);
    return HttpResponse.serverError(e);
  }
};
