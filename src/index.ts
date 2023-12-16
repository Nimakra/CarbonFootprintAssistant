import {
    Canister,
    ic,
    Err,
    nat64,
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

// Define constants for error messages
const ERR_INVALID_INPUT = 'Invalid input parameters';
const ERR_USER_NOT_FOUND = 'User not found';
const ERR_ENV_FACTORS_NOT_FOUND = 'Environmental factors not found';
const ERR_BENCHMARK_DATA_NOT_FOUND = 'Benchmark data not found';

const EmissionRecord = Record({
    id: Principal,
    activityType: text,
    description: text,
    emissions: nat64, // in kilograms of CO2 equivalent
    date: text,
});

type EmissionRecord = typeof EmissionRecord;

const UserData = Record({
    principal: Principal,
    username: text,
    emissionsRecords: Vec(EmissionRecord),
});

type UserData = typeof UserData;

const UserSettings = Record({
    principal: Principal,
    preferredUnits: text,
    notificationsEnabled: bool,
});

type UserSettings = typeof UserSettings;

const EnvironmentalFactors = Record({
    id: Principal,
    factorName: text,   // e.g. "Electricity"
    factorDescription: text,    // e.g. "Emissions factor for electricity"
    factorValue: nat64,   // e.g. 0.5
});

type EnvironmentalFactors = typeof EnvironmentalFactors;

const ActivityType = Record({
    id: Principal,
    activityName: text,
    activityDescription: text,
    activityEmissionsFactor: nat64,
});

type ActivityType = typeof ActivityType;

const BenchmarkData = Record({
    id: Principal,
    benchmarkName: text,
    emissionsThreshold: nat64,
});

type BenchmarkData = typeof BenchmarkData;

const UserActivityHistory = Record({
    principal: Principal,
    activityType: text,
    history: Vec(EmissionRecord),
});

type UserActivityHistory = typeof UserActivityHistory;

// Initialize the storage for UserData
let userDataStorage = StableBTreeMap(Principal, UserData, 0);

// Initialize the storage for UserSettings
let userSettingsStorage = StableBTreeMap(Principal, UserSettings, 1);

// Initialize the storage for EnvironmentalFactors
let environmentalFactorsStorage = StableBTreeMap(Principal, EnvironmentalFactors, 2);

// Initialize storage for user ActivityHistory
let userActivityHistoryStorage = StableBTreeMap(Principal, UserActivityHistory, 3);

// Initialize storage for BenchmarkData
let benchmarkDataStorage = StableBTreeMap(Principal, BenchmarkData, 4);

export default Canister({
    // Calculate the emissions for an activity and store the record 
    calculateEmissions: update(
        [text, text, nat64, text],
        Result(EmissionRecord, text),
        async (activityType, description, emissions, date) => {
            // Validate input parameters
            if (!activityType || !description || emissions <= 0 || !date) {
                return Result.Err(ERR_INVALID_INPUT);
            }

            // Generate a unique ID for the EmissionRecord
            const id = Principal.fromText(`${activityType}-${date}`);

            // Fetch relevant environmental factors
            const environmentalFactorOpt = environmentalFactorsStorage.get(id);

            if (Opt.has(environmentalFactorOpt)) {
                const environmentalFactor = Opt.get(environmentalFactorOpt);

                const adjustedEmissions = emissions * environmentalFactor.factorValue;

                // Create an EmissionRecord
                const emissionRecord: EmissionRecord = {
                    id,
                    activityType,
                    description,
                    emissions: adjustedEmissions,
                    date,
                };

                // Get the user's data
                const principal = ic.caller();
                const userDataOpt = userDataStorage.get(principal);

                if (Opt.has(userDataOpt)) {
                    const userData = Opt.get(userDataOpt);

                    // Update user's emissions records
                    userDataStorage.insert(principal, {
                        ...userData,
                        emissionsRecords: userData.emissionsRecords.concat([emissionRecord]),
                    });

                    // Return calculated emissions
                    return Result.Ok(emissionRecord);
                } else {
                    // Return an error if the user is not found
                    return Result.Err(ERR_USER_NOT_FOUND);
                }
            } else {
                // Return an error if environmental factors are not found
                return Result.Err(ERR_ENV_FACTORS_NOT_FOUND);
            }
        }
    ),

    // Get the total emissions for a user
    getTotalEmissions: query([], Variant({ Ok: nat64, Err: text }), () => {
        const principal = ic.caller();
        const userDataOpt = userDataStorage.get(principal);

        if (Opt.has(userDataOpt)) {
            const userData = Opt.get(userDataOpt);

            // Calculate total emissions
            const totalEmissions = userData.emissionsRecords.reduce((sum: nat64, record: EmissionRecord) => sum + record.emissions, 0n);

            // Return the total emissions
            return { Ok: totalEmissions };
        } else {
            return { Err: ERR_USER_NOT_FOUND };
        }
    }),

    // Get emissions records for a user
    getEmissionsRecords: query([], Variant({ Ok: Vec(EmissionRecord), Err: text }), () => {
        const principal = ic.caller();
        const userDataOpt = userDataStorage.get(principal);

        if (Opt.has(userDataOpt)) {
            const userData = Opt.get(userDataOpt);

            // Return the emissions records
            return { Ok: userData.emissionsRecords };
        } else {
            return { Err: ERR_USER_NOT_FOUND };
        }
    }),

    // Function to compare user emissions with benchmark data 
    compareEmissions: query([], Variant({ Ok: text, Err: text }), () => {
        const principal = ic.caller();
        const userDataOpt = userDataStorage.get(principal);

        if (Opt.has(userDataOpt)) {
            const userData = Opt.get(userDataOpt);

            // Calculate total emissions
            const totalEmissions = userData.emissionsRecords.reduce((sum: nat64, record: EmissionRecord) => sum + record.emissions, 0n);

            // Get benchmark data
            const benchmarkDataOpt = benchmarkDataStorage.get(principal);

            if (Opt.has(benchmarkDataOpt)) {
                const benchmarkData = Opt.get(benchmarkDataOpt);

                // Compare user emissions with benchmark data
                if (totalEmissions > benchmarkData.emissionsThreshold) {
                    return { Ok: 'Your emissions are higher than the benchmark. Keep it up!' };
                } else {
                    return { Ok: 'Your emissions are lower than the benchmark. You can still do it!' };
                }
            } else {
                return { Err: ERR_BENCHMARK_DATA_NOT_FOUND };
            }
        } else {
            return { Err: ERR_USER_NOT_FOUND };
        }
    }),

    // Get personalized recommendations based on emissions
    getRecommendations: query([nat64], Variant({ Ok: Vec(text), Err: text }), (targetReduction) => {
        const principal = ic.caller();
        const userDataOpt = userDataStorage.get(principal);

        if (Opt.has(userDataOpt)) {
            const userData = Opt.get(userDataOpt);

            // Calculate current emissions
            const currentEmissions = userData.emissionsRecords.reduce((sum: nat64, record: EmissionRecord) => sum + record.emissions, 0n);

            // Calculate reduction percentage
            const reductionPercentage = ((currentEmissions - targetReduction) / currentEmissions) * 100n;

            // Generate recommendations based on reduction percentage
            if (reductionPercentage >= 10n) {
                return { Ok: [`Great job ${userData.username}! You are making a very significant impact on the environment, and for future generations.`] };
            } else {
                return { Ok: ['Please consider reducing energy consumption, using public transportation, and or choosing sustainable food options to reduce emissions.'] };
            }
        } else {
            return { Err: ERR_USER_NOT_FOUND };
        }
    }),

    getHistoricalData: query([text], Variant({ Ok: Vec(nat64), Err: text }), (activityType: text) => {
        const principal = ic.caller();
        const userDataOpt = userDataStorage.get(principal);

        if (Opt.has(userDataOpt)) {
            const userData = Opt.get(userDataOpt);

            // Filter and map historical emissions data based on activityType
            const historicalData = userData.emissionsRecords
                .filter((record: EmissionRecord) => record.activityType === activityType)
                .map((record: EmissionRecord) => record.emissions);

            // Return the historical emissions data
            return { Ok: historicalData };
        } else {
            return { Err: ERR_USER_NOT_FOUND };
        }
    }),

    // Generate a report for a user for total emissions and recommendations 
    generateReport: query([], Variant({ Ok: text, Err: text }), () => {
        const principal = ic.caller();
        const userDataOpt = userDataStorage.get(principal);

        if (Opt.has(userDataOpt)) {
            const userData = Opt.get(userDataOpt);

            // Calculate total emissions
            const totalEmissions = userData.emissionsRecords.reduce((sum: nat64, record: EmissionRecord) => sum + record.emissions, 0n);

            let recommendations = '';
            if (totalEmissions > 1000n) {
                recommendations = 'Please consider reducing energy consumption, using public transportation, and or choosing sustainable food options to reduce emissions.';
            } else {
                recommendations = 'Great job! You are making a very significant impact on the environment, and for future generations.';
            }

            // Generate a report
            const report = `Total emissions: ${totalEmissions} kg CO2 equivalent\n\nRecommendations:\n${recommendations}`;

            return { Ok: report };
        } else {
            return { Err: ERR_USER_NOT_FOUND };
        }
    }),

    //Generate user settings 
    generateUserSettings: update([text, bool], Result(UserSettings, text), (preferredUnits, notificationsEnabled) => {
        // Validate input parameters
        if (!preferredUnits || !notificationsEnabled) {
            return Result.Err(ERR_INVALID_INPUT);
        }

        const principal = ic.caller();
        const userDataOpt = userDataStorage.get(principal);

        if (Opt.has(userDataOpt)) {
            const userData = Opt.get(userDataOpt);

            // Create a UserSettings
            const userSettings: UserSettings = {
                principal,
                preferredUnits,
                notificationsEnabled,
            };

            // Update the user's settings
            userSettingsStorage.insert(principal, userSettings);

            return Result.Ok(userSettings);
        } else {
            return Result.Err(ERR_USER_NOT_FOUND);
        }
    }),

    // Get user settings  
    getUserSettings: query([], Variant({ Ok: UserSettings, Err: text }), () => {
        const principal = ic.caller();
        const userSettingsOpt = userSettingsStorage.get(principal);

        if (Opt.has(userSettingsOpt)) {
            const userSettings = Opt.get(userSettingsOpt);

            return { Ok: userSettings };
        } else {
            return { Err: ERR_USER_NOT_FOUND };
        }
    }),

    //generate user activity history
    generateUserActivityHistory: update([text, Vec(EmissionRecord)], Result(UserActivityHistory, text), (activityType, history) => {
        if (!activityType || !history) {
            return Result.Err(ERR_INVALID_INPUT);
        }

        const principal = ic.caller();
        const userDataOpt = userDataStorage.get(principal);

        if (Opt.has(userDataOpt)) {
            const userData = Opt.get(userDataOpt);

            // Create a UserActivityHistory
            const userActivityHistory: UserActivityHistory = {
                principal,
                activityType,
                history,
            };

            // Update the user's activity history
            userActivityHistoryStorage.insert(principal, userActivityHistory);

            // Return the user activity history
            return Result.Ok(userActivityHistory);
        } else {
            // Return an error if the user is not found
            return Result.Err(ERR_USER_NOT_FOUND);
        }
    }),

});

globalThis.crypto = {
    // @ts-ignore
    getRandomValues: () => {
        let array = new Uint8Array(32);

        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }

        return array;
    }
}
