# cubbit-assignment
S3 compatible HTTP service to download and save files, using the AWS S3 Protocol

## Developing the project

### Stack used

The chosen tech stack is ExpressJS for the server, Mongoose for the DBMS, and Jest for unit testing.


### How the task was approached:

- Choose and set up a DBMS for storing the Buckets and Objects data
- Design the data model for Buckets and Objects
- Implement CreateBucket API endpoint
- Implement PutObject API endpoint
- Implement ListObjects API endpoint
- Containerize the application using Docker
- Develop Unit Tests for the application controller and service


### Accomplishments and shortcomings

The mandatory requirements were implemented and work as described. 
I developed some unit tests to complement these requirements and the AWS CLI works well with the project.
I created a docker-compose that manages the mongodb dependency, so simply running docker-compose up will get the app up and running.

As for the optional requirements, I implemented the endpoints, however I couldn't find out how to get the object's body from the AWS CLI command.
I tried inspecting the request but couldn't find it, so I read through the AWS documentation but no luck either, so I was unable to properly store it in the database as well.
As a result the optional requirements aren't properly developed and won't work.




## Project structure

There 3 main layers for this application, the "main" app entrypoint, the controller and the service.
There is also a unit test component, where the service and the controller are tested.


### Main
Implemented in src/app.ts, it sets up the server and the database connection


### Controller
Implemented in src/controllers/app.controller.ts, it sets up the server routes for the API endpoints


### Service
Implemented in src/services/app.service.ts, it handles the database integration.
The Database models are defined in src/models/app.model.ts, one for the Bucket and one for the Object


### Unit Tests
Implemented in test/, one for the controller and one for the service, they test basic functionality of these components




## Starting the Project:
### To start the project, follow these steps:

Clone the repository and navigate to the project directory.
Run npm install to install dependencies.
Run npm run build to build the TypeScript files.
Run docker-compose up to download and start the mongodb image as well as to build the project image
Use the AWS CLI to interact with the API endpoints.
