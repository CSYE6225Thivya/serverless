# Serverless function
## Assignment - 7

This repository contains code for a serverless infrastructure setup using Google Cloud Functions.

## Overview

The serverless infrastructure utilizes Google Cloud Functions to handle tasks triggered by events. In this setup, a Cloud Function is triggered by a Pub/Sub message whenever a new user account is created. The Cloud Function then performs two main tasks:

1. Email Verification**: It sends an email to the user containing a verification link. This link expires after 2 minutes to ensure security and validity. The email is sent using Mailgun service.

2. Database Update**: It updates a Cloud SQL database to track the emails sent, including details such as the recipient's email, verification token, and the expiration time of the verification link.


## Setup

1. Dependencies: Have to ensure the necessary dependencies installed. This includes the Google Cloud SDK ('gcloud') and Node.js.

2. Environment Variables: Set up environment variables for your Google Cloud project, Mailgun API key, and database credentials. 

3. Deployment: Deploying Cloud Function from GCP Bucket

To deploy the Cloud Function from the code stored in a GCP bucket, follow these steps:

1. **Access the Bucket**: 
   - Navigate to the Google Cloud Storage section of the GCP Console.
   - Create a new bucket named "my-serverless-function"
   - Upload the Cloud Function code file as email.zip.

2. **Download Cloud Function Code**: 
   - Click on the Cloud Function code file stored in the bucket.
   - Choose the option to download the file to your local machine.

3. **Deploy Cloud Function**:
   - Navigate to the Google Cloud Functions section of the GCP Console.
   - Click on the "Create function" button.
   - Provide a name and description for your Cloud Function.
   - Choose the option to upload a zip file.
   - Upload the Cloud Function code file that you downloaded from the bucket.
   - Configure the trigger for your Cloud Function (e.g., HTTP trigger, Pub/Sub trigger).
   - Click on the "Create" button to deploy the Cloud Function.
   - Specify the Cloud Storage bucket and object name in the Terraform configuration for the Cloud Function resource. 


## Usage

To use this infrastructure:

1. Create a new user account in your web application.
2. The Cloud Function will be triggered automatically upon new user creation.
3. An email containing a verification link will be sent to the user's email address.
4. The Cloud SQL database will be updated to track the email sent.


