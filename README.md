# Carbon Footprint Assistant and Tracker

## Overview

Welcome to the Carbon Footprint Assistant and Tracker, a very powerful and versatile tool that is designed to help users track and manage their carbon emissions. In line with the Sustainable Development Goals, this application goes beyond simple calculations and tracking by offering personalized recommendations, secure data storage, historical insights, detailed reports, and many more! This project uses the [general equation for emission calculation.](https://www.epa.gov/air-emissions-factors-and-quantification/basic-information-air-emissions-factors-and-quantification)

## Main Features
- Internet Identity for secure login on the ICP
- Calculate emissions for various activities.
- Provide report with personalized recommendations to users.
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

Follow these instructions from the Azle Book [to install all the required tools and set up your environment](https://demergent-labs.github.io/azle/installation.html). You can skip this step if you have already installed the required tools.
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
### Register User
Registers each user
### Add Activity
Adds the activity that generates emissions
### Calculate Emissions
Calculates the emissions for a specific activity and stores the record securely.
### Get Total Emissions
Retrieves the total emissions for a user.
### Compare Emissions
Compares user emissions with benchmark data.
### Get Personalized Recommendations
Gets personalized recommendations based on the user's emission activity.
### Generate Report
Generates a very comprehensive report for a user that includes the total emissions and personalized recommendations.
### Get Emissions by Activity Type
Retrieves the emission records for a user based on the activity types of that user.

![Carbon Footprint Assistant in Candid UI](/src/assets/CarbonFootprintAssistant.png)

**Note:** To calculate the emissions, use the principal ID generated when you registered the user.
This also applies to all the other functions that require ther user ID.

## Data Structures:

- EmissionRecord: A record of emissions for a specific activity.
- UserData: Stores user information.
- UserSettings: Holds user-specific settings.
- ActivityType: Describes different types of activities that contribute to emissions.
- BenchmarkData: Compares user emissions with benchmark data


# Please add a star :star: if you liked the project. Let's make the world a better place. Happy Coding!
