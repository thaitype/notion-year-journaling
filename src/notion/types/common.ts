import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { PageProperties } from './notion-database-props';

export type TypedPageObjectResponse<T> = Omit<
PageObjectResponse,
  'properties'
> & {
  properties: T;
};
