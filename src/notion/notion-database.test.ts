import { expect, test, describe } from 'vitest';
import { NotionDatabase } from './notion-database';
import { PageProperties } from './types';

class TestNotionDatabase<T extends Record<string, PageProperties['type']>> extends NotionDatabase<T> {
  processQueryPredicate = super.processQueryPredicate;

  setPropTypes<const T extends Record<string, PageProperties['type']>>(props: T) {
    super.setPropTypes(props);
    return this as unknown as TestNotionDatabase<T>;
  }
}

describe('Test processQueryPredicate', () => {
  test('When predicate is undefined', () => {
    expect(new TestNotionDatabase({} as any, '').processQueryPredicate()).toBe(undefined);
  });

  test('When predicate is plain filter object', () => {
    expect(
      new TestNotionDatabase({} as any, '').processQueryPredicate({
        filter: {
          property: 'Test',
          date: {
            is_empty: true,
          },
        },
      })
    ).toStrictEqual({
      filter: {
        property: 'Test',
        date: {
          is_empty: true,
        },
      },
    });
  });

  test('When predicate is function, without helper function', () => {
    expect(
      new TestNotionDatabase({} as any, '').processQueryPredicate(prop => ({
        filter: {
          property: 'Test',
          date: {
            is_empty: true,
          },
        },
      }))
    ).toStrictEqual({
      filter: {
        property: 'Test',
        date: {
          is_empty: true,
        },
      },
    });
  });

  test('When predicate is function, with helper function', () => {
    expect(
      new TestNotionDatabase({} as any, '')
        .setPropTypes({
          Test: 'date',
        })
        .processQueryPredicate(prop => ({
          filter: prop['Test'].filter({
            date: {
              is_empty: true,
            },
          }),
        }))
    ).toStrictEqual({
      filter: {
        property: 'Test',
        type: 'date',
        date: {
          is_empty: true,
        },
      },
    });
  });
});
