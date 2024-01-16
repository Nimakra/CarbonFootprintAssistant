import {
  Canister,
  ic,
  Err,
  nat64,
  float64,
  Ok,
  Opt,
  Principal,
  query,
  Record,
  Result,
  StableBTreeMap,
  text,
  update,
  Variant,
  Vec,
  bool
} from 'azle';

import { v4 as uuidv4 } from "uuid";

const ActivityType = Record({
  id: Principal,
  activityName: text, // e.g. "Driving"
  activityDescription: text, // e.g. "Driving a car over 100km"
  activityEmissionsFactor: float64, // e.g. 0.5
  activityRate: nat64, // e.g. 100 (in km). Here, The rate of driving a car over 100km is 100
  activityEmmissionReduction: nat64 // e.g. 10 (in %)
});

type ActivityType = typeof ActivityType;

const EmissionRecord = Record({
  id: Principal,
  activityName : text,
  activityDescription: text,
  emissions: nat64, // in kilograms of CO2 equivalent
  date: nat64,
});

type EmissionRecord = typeof EmissionRecord;

const UserData = Record({
  id: Principal,
  username: text,
  emissionsRecords: Vec(EmissionRecord),
});

type UserData = typeof UserData;

const BenchmarkData = Record({
  id: Principal,
  benchmarkName: text,
  emissionsThreshold: nat64,
  });
  
  type BenchmarkData = typeof BenchmarkData;

const UserSettings = Record({
  principal: Principal,
  preferredUnits: text,
  notificationsEnabled: bool,
  
  });
  
  type UserSettings = typeof UserSettings;

// Initialize the storage for UserData
let userDataStorage = StableBTreeMap(Principal, UserData, 0);

// Initialize the storage for ActivityType
let activityTypeStorage = StableBTreeMap(Principal,ActivityType,1);

// Initialize the storage for BenchmarkData
let benchmarkDataStorage = StableBTreeMap(Principal, BenchmarkData, 2);

// Initialize the storage for UserSettings
let userSettingsStorage = StableBTreeMap(Principal, UserSettings, 3);

export default Canister({

  // Register a user
  registerUser: update([text], Result(UserData, text), (username) => {
    // Validate input parameters
    if (!username) {
      return Result.Err('Username cannot be blank. Please enter a username.');
    }

    //generate error if username already exists
    const userPrincipalOpt = userDataStorage.values().find((user: { username: string; }) => user.username === username);
    if (userPrincipalOpt) {
      return Result.Err('Username already exists. Please enter a different username.');
    }
    
    // Generate a unique ID for the user
   const id = Principal.fromHex(uuidv4().replace(/-/g, ''));

    // Create a UserData
    const userData: UserData = {
      id,
      username,
      emissionsRecords: [],
    };

    // Insert the user into the storage
    userDataStorage.insert(id, userData);

    // Return the user data
    return Result.Ok(userData);
  }),

  // Add an activity type
  addActivityType: update([text, text, float64, nat64, nat64], Result(ActivityType, text), (activityName, activityDescription, activityEmissionsFactor, activityRate, activityEmmissionReduction) => {
    // Validate input parameters
    if (!activityName || !activityDescription || !activityEmissionsFactor || !activityRate || !activityEmmissionReduction) {
      return Result.Err('Incomplete details. Please provide all valid details.');
    }

    // Generate a unique ID for the activity type
    const id = Principal.fromHex(uuidv4().replace(/-/g, ''));

    // Create an ActivityType
    const activityType: ActivityType = {
      id,
      activityName,
      activityDescription,
      activityEmissionsFactor,
      activityRate,
      activityEmmissionReduction
    };

    // Insert the activity type into the storage
    activityTypeStorage.insert(id, activityType);

    // Return the activity type
    return Result.Ok(activityType);
  }),

  //calculate emissions for an activity entered by the user and add it to the user's emissions record
  calculateEmissions:update(
    [Principal, text],
    Result(EmissionRecord, text),
    async (userId, activityName) => {
      // Validate input parameters
      if (!userId || !activityName) {
        return Result.Err('Incomplete details. Please provide all valid details.');
      }
  
      // Find the user based on the userId entered
      const userDataOpt = userDataStorage.get(userId);

      if (!userDataOpt) {
        return Result.Err(`User with id=${userId} not found.`);
      }
  
      const userData = userDataOpt.Some; 
     
      // Check if the activity exists
      const activityTypeOpt = activityTypeStorage.values().find((type: { activityName: string; }) => type.activityName === activityName);
  
      if (!activityTypeOpt) {
        return Result.Err('Activity not found. Please set up activity.');
      }
  
      const activityType = activityTypeOpt; // activityTypeOpt is the found ActivityType
  
      // Calculate emissions based on the activity type formula
      const calculatedEmissions = calculateEmissionsForActivity(activityType);
     
      // Create an EmissionRecord
      const emissionRecord: EmissionRecord = {
        id: Principal.fromHex(uuidv4().replace(/-/g, '')),
        activityName: activityType.activityName,
        activityDescription: activityType.activityDescription,
        emissions: calculatedEmissions,
        date: ic.time() // Assuming current date for the emission record
      };

      //Update the user data  
      userDataStorage.insert(userId, {
          ...userData,
          emissionsRecords: userData.emissionsRecords.concat([emissionRecord]),
      });
      return Result.Ok(emissionRecord);

    }),

  //Get total emissions for a user
  getUserTotalEmissions: query([Principal], Variant({ Ok: nat64, Err: text }), (userId) => {
   
    // Find the user based on the userId entered    
    const userDataOpt = userDataStorage.get(userId);

    if ('Some' in userDataOpt) {
      const userData = userDataOpt.Some;

      // Check if the user has emission records
      if (userData.emissionsRecords.length === 0) {
        // Return 0 if there are no emission records
        return { Ok: 0n };
      }

      // Calculate total emissions 
      const totalEmissions = userData.emissionsRecords.reduce((sum: nat64, record: EmissionRecord) => sum + record.emissions, 0n);

      // Return the total emissions
      return { Ok: totalEmissions };

    } else {
             return { Err: 'User not found.' };         
    }
  }),

//Get emissions records for a user
  getUserEmissionsRecords: query([Principal], Variant({ Ok: Vec(EmissionRecord), Err: text }), (userId) => {
      
    const userDataOpt = userDataStorage.get(userId);

    if ('Some' in userDataOpt) {
      const userData = userDataOpt.Some;

      // Return the emissions records
      return { Ok: userData.emissionsRecords };
    } else {
             return { Err: `User with id=${userId} not found.` };
    }
  }), 

  //add benchmark data for a user
  addBenchmarkData: update([Principal, text, nat64], Result(BenchmarkData, text), (userId, benchmarkName, emissionsThreshold) => {
    // Validate input parameters
    if (!userId ||!benchmarkName || !emissionsThreshold) {
      return Result.Err('Incomplete details. Please provide all valid details.');
    }

    const userDataOpt = userDataStorage.get(userId);
    if ('Some' in userDataOpt) {

      const benchmarkData: BenchmarkData = {
        id: userId,
        benchmarkName,
        emissionsThreshold,
      };

      // Insert the benchmark data into the storage
    benchmarkDataStorage.insert(userId, benchmarkData);

    // Return the benchmark data
    return Result.Ok(benchmarkData);
    } else {
             return Result.Err(`User with id=${userId} not found.`);
    }
  }),

  
  // Function to compare user emissions with benchmark data 
  compareEmissionsWithBenchmark: query([Principal], Variant({ Ok: text, Err: text }), (userId) => {
    
    //Find the user
    const userDataOpt = userDataStorage.get(userId);

    if ('Some' in userDataOpt) {
      const userData = userDataOpt.Some;

      // Calculate current emissions
      const totalEmissions = userData.emissionsRecords.reduce((sum: nat64, record: EmissionRecord) => sum + record.emissions, 0n);
      
      // Get benchmark data
      const benchmarkDataOpt = benchmarkDataStorage.get(userId)
      if (!benchmarkDataOpt) {
        return Result.Err('Benchmark data not found.');
      }

      const benchmarkData = benchmarkDataOpt; // benchmarkDataOpt is the found BenchmarkData

      // Compare emissions with benchmark data
      if (totalEmissions < benchmarkData.emissionsThreshold) {
        return { Ok: 'Your emissions are higher than the benchmark.' };
      } else {
        return { Ok: 'Your emissions are lower than the benchmark.' };
      }
    } else {
      return { Err: `User with id=${userId} not found.` };
    }
  }),

  //Get Historical data
  getHistoricalData: query([Principal,text], Variant({ Ok: Vec(nat64), Err: text }), (userId,activityName: text) => {
    
    //Find the user
    const userDataOpt = userDataStorage.get(userId);
  
    if ('Some' in userDataOpt) {
      const userData = userDataOpt.Some;
  
      // Filter and map historical emissions data based on activityType
      const historicalData = userData.emissionsRecords
        .filter((record: EmissionRecord) => record.activityName === activityName)
        .map((record: EmissionRecord) => record.emissions);
  
      // Return the historical emissions data
      return { Ok: historicalData };
    } else {
     
      return { Err: `User with id=${userId} not found.` };
    }
  }),
  
  // Generate a report for a user for total emmissions and recommendations 
  generateReport: query([Principal], Variant({ Ok: text, Err: text }), (userId) => {
  
    //Find the user
    const userDataOpt = userDataStorage.get(userId);

    if ('Some' in userDataOpt) {
      const userData = userDataOpt.Some;

      const totalEmissions = userData.emissionsRecords.reduce((sum: nat64, record: EmissionRecord) => sum + record.emissions, 0n);

      let recommendations = '';
      if (totalEmissions > 1000n) {
        recommendations = 'Please consider reducing energy consumption, using public transportation, and or choosing sustainable food options to reduce emissions.';
      } else {
        recommendations =  `Great job ${userData.username}! You are making a very significant impact on the environment, and for future generations.` ;
      }

      // Generate a report
      const report = `Total emissions: ${totalEmissions} kg CO2 equivalent\n\nRecommendations:\n${recommendations}`;
      
      return { Ok: report };
    } else {
    
      return { Err: `User with id=${userId} not found.` };
    }
  }),
 
  //Generate user settings 
  generateUserSettings: update([Principal,text, bool], Result(UserSettings, text), (userId, preferredUnits, notificationsEnabled) => {
    // Validate input parameters
    if (!preferredUnits || !notificationsEnabled) {
      return Result.Err('Incomplete details. Please provide all valid details.');
    }
    //Find the user
    const userDataOpt = userDataStorage.get(userId);

    if ('Some' in userDataOpt) {

      // Create a UserSettings
      const userSettings: UserSettings = {
        principal: userId,
        preferredUnits,
        notificationsEnabled,
      };

      // Update the user's settings
      userSettingsStorage.insert(userId, userSettings);

      return Result.Ok(userSettings);
    } else {

      return Result.Err(`User with id=${userId} not found.`);
    }
  }), 

  // Get user settings  
  getUserSettings: query([Principal], Variant({ Ok: UserSettings, Err: text }), (userId) => {

    //Find the user
    const userSettingsOpt = userSettingsStorage.get(userId);

    if ('Some' in userSettingsOpt) {
      const userSettings = userSettingsOpt.Some;

    
      return { Ok: userSettings };
    } else {
      return { Err: `User with id=${userId} not found.` };
    }
  }), 
      
}); 

// Helper function to calculate the emissions for an activity based on the formula: emissions = activityRate x activityEmissionsFactor x (1- activityEmmissionReduction/100)
function calculateEmissionsForActivity(activityType: ActivityType): nat64 {

  const emissions = BigInt(activityType.activityRate) * 
  BigInt(activityType.activityEmissionsFactor * 100) * 
  (1n - BigInt(activityType.activityEmmissionReduction) / 100n) / 100n;

  // Ensure the result is a non-negative integer
  return BigInt(Math.max(0, Math.round(Number(emissions))));
}

globalThis.crypto = {
  // @ts-ignore
 getRandomValues: () => {
     let array = new Uint8Array(32)

     for (let i = 0; i < array.length; i++) {
         array[i] = Math.floor(Math.random() * 256)
     }

     return array
 }
}
