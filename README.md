# Carbon Footprint Assistant and Tracker

## Overview

Welcome to the Carbon Footprint Asistant and Tracker , a very powerful and versatile tool that is designed to help users track and manage their carbon emissions. In line with the Sustainable Development Goals, this application goes beyond simple calculations by offering personalized recommendations, secure data storage, historical insights, detailed reports and many more!.

## Main Features
- Internet Identity for secure login on the ICP
- Calculate emissions for various activities.
- Provide personalized recommendations to users.
- Securely store user data.
- Retrieve historical emissions data.
- Generate comprehensive reports.
- Compare user emissions with benchmark data
- Generate User Settings

  

## Table of Contents

1. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
2. [Functions](#functions)
   - [Calculate Emissions](#calculate-emissions)
   - [Get Total Emissions](#get-total-emissions)
   - [Get Recommendations](#get-recommendations)
   - [Generate Report](#generate-report)
   - [Get Emissions by Activity Type](#get-emissions-by-activity-type)
3. [Data Structures](#data-structures)


## Getting Started

### Prerequisites

Follow these instructions from the Azle Book [to install all the required tools and set up your environment](https://demergent-labs.github.io/azle/installation.html). If you have already installed the required tools, you can skip this step.
After you have installed the required tools, you can move on to the next step.

### Installation

1. **Clone the repository:**
   ```bash
   https://github.com/Nimakra/CarbonFootprintAssistant.git
   cd CarbonFootprintAssistant

2. **Install dependencies:**
   ```bash
   npm install

3. **Start the local replica:**
   ```bash
   dfx start --clean --background

4. **Deploy the canister locally:**
   ```bash
   dfx deploy
   
## Main Functions:
### Calculate Emissions
Calculates the emissions for a specific activity and stores the record securely.
### Get Total Emissions
Retrieves the total emissions for a user..
### Get Personalized Recommendations
Getsthe personalized recommendations based on the user's emission activity.
### Generate Report
Generates a very comprehensive report for a user that includes the total emissions and the personalized recommendations.
### Get Emissions by Activity Type
Retrieves the emission records for a user based on the activity types of that user.

## Data Structures:

- EmissionRecord: A record of emissions for a specific activity.
- UserData: Stores user information.
- UserSettings: Holds user-specific settings.
- EnvironmentalFactors: Records environmental factors that affect emissions.
- ActivityType: Describes different types of activities that contribute to emissions.
- UserActivityHistory: Maintains a history of emissions for each user.
