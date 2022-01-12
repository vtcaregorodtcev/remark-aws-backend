import { DynamoDBStreamHandler } from 'aws-lambda';
import { DynamoDB, S3 } from 'aws-sdk';
import { BOOKMARKS_TABLE_NAME, MODEL_BUCKET } from '../constants';
import { Logger } from 'helpers/Logger';
import { BookmarkProvider, ModelProvider } from 'providers';

const logger = new Logger('Train Model');

const db = new DynamoDB();
const bookmarksProvider = new BookmarkProvider(db, BOOKMARKS_TABLE_NAME);

const s3 = new S3();
const modelProvider = new ModelProvider(s3, MODEL_BUCKET);

export const handler: DynamoDBStreamHandler = async (event) => {
  logger.log('Event', JSON.stringify(event));
  try {
    // train only on updates
    if (event.Records[0].eventName === 'MODIFY') {
      const bookmarks = await bookmarksProvider.scanBookmarks();

      logger.log('Training...');
      const model = modelProvider.train(ModelProvider.create(), bookmarks);

      logger.log('Training Success!', model);
      await modelProvider.save(model);

      logger.log('Saved!');
    }
  } catch (e) {
    logger.err('Error', e);
  }
};
