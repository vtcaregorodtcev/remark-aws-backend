import { DynamoDB, S3 } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { HttpResponse } from '../helpers/HttpResponse';
import { Logger } from '../helpers/Logger';
import { BookmarkProvider, ModelProvider } from '../providers';
import { BOOKMARKS_TABLE_NAME, MODEL_BUCKET } from '../constants';
import { Bookmark } from 'types/bookmark';

const logger = new Logger('Create Bookmark');

const db = new DynamoDB();
const bookmarksProvider = new BookmarkProvider(db, BOOKMARKS_TABLE_NAME);

const s3 = new S3();
const modelProvider = new ModelProvider(s3, MODEL_BUCKET);

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    logger.log('Event', JSON.stringify(event));

    const bookmark = JSON.parse(event.body || '{}' as string) as Bookmark;
    logger.log('Body', bookmark);

    const model = await modelProvider.load();
    logger.log('Model', model);

    const classifications = model.getClassifications(bookmark.Text);
    logger.log('Classifications', classifications);

    const topLabels = classifications
      .sort((a, b) => a.value - b.value)
      .map(cl => cl.label);

    if (!topLabels.length) {
      topLabels.push('New Label');
    }

    bookmark.Label = topLabels[0];
    bookmark.TopLabels = topLabels.slice(0, 3).join();

    const result = await bookmarksProvider.createBookmark(bookmark);
    logger.log('ResultId', result.Id);

    return HttpResponse.success(result);
  } catch (e) {
    logger.err('Error', e);
    return HttpResponse.serverError(e);
  }
};
