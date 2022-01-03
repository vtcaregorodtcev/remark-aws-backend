import Joi from 'joi';

export const bookmarkIdSchema = Joi.object()
  .keys({
    bookmarkId: Joi.string()
      .guid({
        version: ['uuidv4'],
      })
      .required(),
  })
  .required();
