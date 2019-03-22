export type InterpolationValues = ReadonlyArray<InterpolationValue>;

export type InterpolationValue = number | string | boolean | null | Query;

export type QueryFragments = ReadonlyArray<QueryFragment>;

export type QueryFragment = string;

export type Query = Readonly<{
  kind: InterpolationValueKind.Query;
  fragments: ReadonlyArray<QueryFragment>;
  values: ReadonlyArray<QueryValue>;
}>;

export enum InterpolationValueKind {
  Query = 'query',
}

export type QueryValues = ReadonlyArray<QueryValue>;

export type QueryValue = number | string | boolean | null;
