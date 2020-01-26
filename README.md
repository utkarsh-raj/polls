# polls
A webapp for polls.

Please visit https://rocky-basin-25590.herokuapp.com for the live version

The features incorporated are:
- Multi user authentication system
  - Users can login and signup
  - The app can simultaneously handle multiple operations
- User portal
  - User can add new questions
  - User can view and vote for all the questions
  - User can filter questions he has asked
- Result Display Page
  - The results are shown in a Pie Chart
  - The number of votes are shown for every option

The technologies utilised are:
- Node.js - for the backend
- Express.js - as the backend framework
- EJS - as the templating engine
- Bootstrap 3 - as the frontend framework
- MongoDB - the database engine
- MongoDB Atlas - the cloud database service
- Heroku - for online cloud deployment (https://rocky-basin-25590.herokuapp.com)
- Git and Github - for Version Control

(Also, for building the application locally, you will require MongoDB Access credentials, which can be obtained for free for a Development Based Plan from https://www.mongodb.com/cloud/atlas: for the demo of the running application please refer the stated link)

If you want to build the application locally:
1. Make sure you have node.js installed, to test it run node -v or npm -v on your cmd/terminal. 
2. If node is not installed then, download the installer from https://nodejs.org/en/download/ 
3. Then run the following commands from your cmd/terminal. 
	- ```git clone https://github.com/utkarsh-raj/polls.git``` 
	- ```cd polls``` 
	- ```npm install``` - To install all the dependencies. 
	- ```node app.js``` - to launch the application.
4. Open localhost:8000 in your browser to view the app running.
