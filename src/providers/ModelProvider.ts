import { Bookmark } from '../types/bookmark';
import { BayesClassifier } from 'natural';
import { S3 } from 'aws-sdk';

const MODEL_BUCKET_COMMON_KEY = 'model.json';

export class ModelProvider {
  constructor(private readonly s3: S3, private readonly bucket: string) { }

  public static create(): BayesClassifier {
    return new BayesClassifier();
  }

  async load(): Promise<BayesClassifier> {
    const raw = await this.s3.getObject({
      Bucket: this.bucket,
      Key: MODEL_BUCKET_COMMON_KEY
    }).promise();

    const data = raw.Body?.toString('utf-8');

    if (data) {
      return BayesClassifier.restore(JSON.parse(data));
    }

    return ModelProvider.create();
  }

  train(model: BayesClassifier, bookmarks: Bookmark[] = []): BayesClassifier {
    bookmarks.map((bookmark) => {
      const { Text, Label } = bookmark || {};

      if (Text && Label) {
        model.addDocument(Text, Label);
      }
    });

    model.train();

    return model;
  }

  async save(model: BayesClassifier): Promise<void> {
    const data = JSON.stringify(model);

    await this.s3.putObject({
      Bucket: this.bucket,
      Key: MODEL_BUCKET_COMMON_KEY,
      Body: Buffer.from(data),
      ContentEncoding: 'base64',
      ContentType: 'application/json'
    }).promise();
  }
}