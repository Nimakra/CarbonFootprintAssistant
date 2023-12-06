export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'calculateEmissions' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Nat64, IDL.Text],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'id' : IDL.Principal,
              'activityType' : IDL.Text,
              'emissions' : IDL.Nat64,
              'date' : IDL.Text,
              'description' : IDL.Text,
            }),
            'Err' : IDL.Text,
          }),
        ],
        [],
      ),
    'compareEmissions' : IDL.Func(
        [],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        ['query'],
      ),
    'generateReport' : IDL.Func(
        [],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        ['query'],
      ),
    'generateUserActivityHistory' : IDL.Func(
        [
          IDL.Text,
          IDL.Vec(
            IDL.Record({
              'id' : IDL.Principal,
              'activityType' : IDL.Text,
              'emissions' : IDL.Nat64,
              'date' : IDL.Text,
              'description' : IDL.Text,
            })
          ),
        ],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'principal' : IDL.Principal,
              'activityType' : IDL.Text,
              'history' : IDL.Vec(
                IDL.Record({
                  'id' : IDL.Principal,
                  'activityType' : IDL.Text,
                  'emissions' : IDL.Nat64,
                  'date' : IDL.Text,
                  'description' : IDL.Text,
                })
              ),
            }),
            'Err' : IDL.Text,
          }),
        ],
        [],
      ),
    'generateUserSettings' : IDL.Func(
        [IDL.Text, IDL.Bool],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'notificationsEnabled' : IDL.Bool,
              'principal' : IDL.Principal,
              'preferredUnits' : IDL.Text,
            }),
            'Err' : IDL.Text,
          }),
        ],
        [],
      ),
    'getEmissionsRecords' : IDL.Func(
        [],
        [
          IDL.Variant({
            'Ok' : IDL.Vec(
              IDL.Record({
                'id' : IDL.Principal,
                'activityType' : IDL.Text,
                'emissions' : IDL.Nat64,
                'date' : IDL.Text,
                'description' : IDL.Text,
              })
            ),
            'Err' : IDL.Text,
          }),
        ],
        ['query'],
      ),
    'getHistoricalData' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Vec(IDL.Nat64), 'Err' : IDL.Text })],
        ['query'],
      ),
    'getRecommendations' : IDL.Func(
        [IDL.Nat64],
        [IDL.Variant({ 'Ok' : IDL.Vec(IDL.Text), 'Err' : IDL.Text })],
        ['query'],
      ),
    'getTotalEmissions' : IDL.Func(
        [],
        [IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : IDL.Text })],
        ['query'],
      ),
    'getUserSettings' : IDL.Func(
        [],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'notificationsEnabled' : IDL.Bool,
              'principal' : IDL.Principal,
              'preferredUnits' : IDL.Text,
            }),
            'Err' : IDL.Text,
          }),
        ],
        ['query'],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
