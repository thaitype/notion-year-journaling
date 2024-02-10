import { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints';
import { Expect, ExpectExtends } from './type-check';
import { PageProperties } from './notion-database-props';

export type QueryFilterArgs = QueryDatabaseParameters['filter'];

export type MapTypePropertyFilter<T extends Record<string, PageProperties['type']>> = {
  [K in keyof T]: {
    filter: (args: Omit<MapTypeToNotionType<T[K], K>, 'property' | 'type'>) => MapTypeToNotionType<T[K], K>;
  };
};

type MapTypeToNotionType<TType extends PageProperties['type'], TProp extends keyof any> = TType extends NonNullable<
  NumberPropFilter<TType>['type']
>
  ? NumberPropFilter<TProp>
  : TType extends NonNullable<DatePropFilter<TType>['type']>
  ? DatePropFilter<TProp>
  : never;

export interface CommonTypeFilter {
  property: string;
  type: string;
}

// TODO: Fix TProp later, it should be only string

export interface NumberPropFilter<TProp extends keyof any = string> {
  number: NumberPropertyFilter;
  property: TProp;
  type: 'number';
}

// TODO: Fix TProp later, it should be only string
export interface DatePropFilter<TProp extends keyof any = string> {
  date: DatePropertyFilter;
  property: TProp;
  type: 'date';
}

// Unit test

// Unit test
type Test = [
  Expect<ExpectExtends<QueryFilterArgs, NumberPropFilter>>,
  Expect<ExpectExtends<QueryFilterArgs, DatePropFilter>>
];

// Sub Type Filter
type EmptyObject = Record<string, never>;
type IdRequest = string | string;

type ExistencePropertyFilter =
  | {
      is_empty: true;
    }
  | {
      is_not_empty: true;
    };
type TextPropertyFilter =
  | {
      equals: string;
    }
  | {
      does_not_equal: string;
    }
  | {
      contains: string;
    }
  | {
      does_not_contain: string;
    }
  | {
      starts_with: string;
    }
  | {
      ends_with: string;
    }
  | ExistencePropertyFilter;
type NumberPropertyFilter =
  | {
      equals: number;
    }
  | {
      does_not_equal: number;
    }
  | {
      greater_than: number;
    }
  | {
      less_than: number;
    }
  | {
      greater_than_or_equal_to: number;
    }
  | {
      less_than_or_equal_to: number;
    }
  | ExistencePropertyFilter;
type CheckboxPropertyFilter =
  | {
      equals: boolean;
    }
  | {
      does_not_equal: boolean;
    };
type SelectPropertyFilter =
  | {
      equals: string;
    }
  | {
      does_not_equal: string;
    }
  | ExistencePropertyFilter;
type MultiSelectPropertyFilter =
  | {
      contains: string;
    }
  | {
      does_not_contain: string;
    }
  | ExistencePropertyFilter;
type StatusPropertyFilter =
  | {
      equals: string;
    }
  | {
      does_not_equal: string;
    }
  | ExistencePropertyFilter;
type DatePropertyFilter =
  | {
      equals: string;
    }
  | {
      before: string;
    }
  | {
      after: string;
    }
  | {
      on_or_before: string;
    }
  | {
      on_or_after: string;
    }
  | {
      this_week: EmptyObject;
    }
  | {
      past_week: EmptyObject;
    }
  | {
      past_month: EmptyObject;
    }
  | {
      past_year: EmptyObject;
    }
  | {
      next_week: EmptyObject;
    }
  | {
      next_month: EmptyObject;
    }
  | {
      next_year: EmptyObject;
    }
  | ExistencePropertyFilter;
type PeoplePropertyFilter =
  | {
      contains: IdRequest;
    }
  | {
      does_not_contain: IdRequest;
    }
  | ExistencePropertyFilter;
type RelationPropertyFilter =
  | {
      contains: IdRequest;
    }
  | {
      does_not_contain: IdRequest;
    }
  | ExistencePropertyFilter;
type FormulaPropertyFilter =
  | {
      string: TextPropertyFilter;
    }
  | {
      checkbox: CheckboxPropertyFilter;
    }
  | {
      number: NumberPropertyFilter;
    }
  | {
      date: DatePropertyFilter;
    };
type RollupSubfilterPropertyFilter =
  | {
      rich_text: TextPropertyFilter;
    }
  | {
      number: NumberPropertyFilter;
    }
  | {
      checkbox: CheckboxPropertyFilter;
    }
  | {
      select: SelectPropertyFilter;
    }
  | {
      multi_select: MultiSelectPropertyFilter;
    }
  | {
      relation: RelationPropertyFilter;
    }
  | {
      date: DatePropertyFilter;
    }
  | {
      people: PeoplePropertyFilter;
    }
  | {
      files: ExistencePropertyFilter;
    }
  | {
      status: StatusPropertyFilter;
    };
type RollupPropertyFilter =
  | {
      any: RollupSubfilterPropertyFilter;
    }
  | {
      none: RollupSubfilterPropertyFilter;
    }
  | {
      every: RollupSubfilterPropertyFilter;
    }
  | {
      date: DatePropertyFilter;
    }
  | {
      number: NumberPropertyFilter;
    };
