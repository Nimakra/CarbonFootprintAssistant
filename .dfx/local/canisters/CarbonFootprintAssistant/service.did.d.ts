import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface _SERVICE {
  'calculateEmissions' : ActorMethod<
    [string, string, bigint, string],
    {
        'Ok' : {
          'id' : Principal,
          'activityType' : string,
          'emissions' : bigint,
          'date' : string,
          'description' : string,
        }
      } |
      { 'Err' : string }
  >,
  'compareEmissions' : ActorMethod<[], { 'Ok' : string } | { 'Err' : string }>,
  'generateReport' : ActorMethod<[], { 'Ok' : string } | { 'Err' : string }>,
  'generateUserActivityHistory' : ActorMethod<
    [
      string,
      Array<
        {
          'id' : Principal,
          'activityType' : string,
          'emissions' : bigint,
          'date' : string,
          'description' : string,
        }
      >,
    ],
    {
        'Ok' : {
          'principal' : Principal,
          'activityType' : string,
          'history' : Array<
            {
              'id' : Principal,
              'activityType' : string,
              'emissions' : bigint,
              'date' : string,
              'description' : string,
            }
          >,
        }
      } |
      { 'Err' : string }
  >,
  'generateUserSettings' : ActorMethod<
    [string, boolean],
    {
        'Ok' : {
          'notificationsEnabled' : boolean,
          'principal' : Principal,
          'preferredUnits' : string,
        }
      } |
      { 'Err' : string }
  >,
  'getEmissionsRecords' : ActorMethod<
    [],
    {
        'Ok' : Array<
          {
            'id' : Principal,
            'activityType' : string,
            'emissions' : bigint,
            'date' : string,
            'description' : string,
          }
        >
      } |
      { 'Err' : string }
  >,
  'getHistoricalData' : ActorMethod<
    [string],
    { 'Ok' : BigUint64Array | bigint[] } |
      { 'Err' : string }
  >,
  'getRecommendations' : ActorMethod<
    [bigint],
    { 'Ok' : Array<string> } |
      { 'Err' : string }
  >,
  'getTotalEmissions' : ActorMethod<[], { 'Ok' : bigint } | { 'Err' : string }>,
  'getUserSettings' : ActorMethod<
    [],
    {
        'Ok' : {
          'notificationsEnabled' : boolean,
          'principal' : Principal,
          'preferredUnits' : string,
        }
      } |
      { 'Err' : string }
  >,
}
