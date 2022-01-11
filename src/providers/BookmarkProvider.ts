import { DynamoDB } from 'aws-sdk';
import { v4 } from 'uuid';
import { Bookmark } from '../types/bookmark';

export class BookmarkProvider {
  constructor(private readonly db: DynamoDB, private readonly table: string) { }

  async createBookmark(bookmark: Bookmark): Promise<Bookmark> {
    const item = { ...bookmark, Id: v4() };

    return new Promise((resolve, reject) => {
      this.db
        .putItem({
          TableName: this.table,
          Item: DynamoDB.Converter.marshall(item),
          ConditionExpression: 'attribute_not_exists(Link)',
        })
        .promise()
        .then(() => resolve(item as Bookmark))
        .catch(async (e: { code: string }) => {
          if (e.code === 'ConditionalCheckFailedException') {
            return resolve(this.getBookmarkByLink(item.Link));
          }

          reject(e);
        });
    });
  }

  async getBookmarkByLink(Link: string): Promise<Bookmark> {
    const bookmark = await this.db
      .getItem({
        TableName: this.table,
        Key: { Link: { S: Link } },
      })
      .promise();

    return BookmarkProvider.unmarshall(bookmark.Item) as Bookmark;
  }

  async updateBookmark(bookmark: Bookmark): Promise<Bookmark> {
    await this.db
      .putItem({
        TableName: this.table,
        Item: DynamoDB.Converter.marshall(bookmark),
      })
      .promise();

    return bookmark;
  }

  async scanBookmarks(): Promise<Bookmark[]> {
    const { Items = [] } = await this.db
      .scan({
        TableName: this.table,
      })
      .promise();

    return (Items || []).map(BookmarkProvider.unmarshall) as Bookmark[];
  }

  private static unmarshall(
    item?: AWS.DynamoDB.AttributeMap | null
  ): Bookmark | null {
    if (item == null) {
      return null;
    }
    return DynamoDB.Converter.unmarshall(item) as Bookmark;
  }
}
