import { PageObjectResponse, RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';
import { DateResponse } from './notion';
import { Expect, ExpectExtends } from './type-check';

export type ExtractRecordValue<T> = T extends Record<string, infer U> ? U : never;
// From @notionhq/client
export type PageProperties = ExtractRecordValue<PageObjectResponse['properties']>;

export interface NumberProp {
  type: 'number';
  number: number | null;
  id: string;
}

export interface DateProp {
  type: 'date';
  date: DateResponse | null;
  id: string;
}

export interface TitleProp {
  type: 'title';
  title: Array<RichTextItemResponse>;
  id: string;
}

// Unit test
type Test = [
  Expect<ExpectExtends<PageProperties, NumberProp>>,
  Expect<ExpectExtends<PageProperties, DateProp>>,
  Expect<ExpectExtends<PageProperties, TitleProp>>
];

export type MapResponseToNotionType<T extends Record<string, PageProperties['type']>> = {
  [K in keyof T]: MapTypeToNotionType<T[K]>;
};

export type MapTypeToNotionType<T extends PageProperties['type']> = T extends NumberProp['type']
  ? NumberProp
  : T extends TitleProp['type']
  ? TitleProp
  : T extends DateProp['type']
  ? DateProp
  : never;
