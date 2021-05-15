// Import the MongoDB driver
const MongoClient = require("mongodb").MongoClient;
const {ObjectId} = require('mongodb');
// Define our connection string. Info on where to get this will be described below. In a real world application you'd want to get this string from a key vault like AWS Key Management, but for brevity, we'll hardcode it in our serverless function here.
const MONGODB_URI = process.env.MONGO_CONNECTION_STRING;

// Once we connect to the database once, we'll store that connection and reuse it so that we don't have to connect to the database on every request.
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  // Connect to our MongoDB database hosted on MongoDB Atlas
  const client = await MongoClient.connect(MONGODB_URI);

  // Specify which database we want to use
  const db = await client.db("api-resume");

  cachedDb = db;
  return db;
}

exports.handler = async (event, context) => {

  /* By default, the callback waits until the runtime event loop is empty before freezing the process and returning the results to the caller. Setting this property to false requests that AWS Lambda freeze the process soon after the callback is invoked, even if there are events in the event loop. AWS Lambda will freeze the process, any state data, and the events in the event loop. Any remaining events in the event loop are processed when the Lambda function is next invoked, if AWS Lambda chooses to use the frozen process. */
  context.callbackWaitsForEmptyEventLoop = false;
  // console.log('event', event);
  let queryData = {};
  const body = JSON.parse(event.body);
  try {
    if (event.pathParameters){
      queryData = {
        _id: ObjectId(event.pathParameters.id),
        secret: event.headers.secret,
      };
    }
  }
  catch (e) {
    return {
    statusCode: 400,
    headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST,GET,PUT"
        },
    body: JSON.stringify({
      "message": "Invalid Id",
      "error": "Invalid request"
    }),
  };
  }
  // Get an instance of our database
  const db = await connectToDatabase(); 

  // Make a MongoDB MQL Query to go into the movies collection and return the feedbacks.
  
    const feedback = await db.collection("feedbacks").findOneAndUpdate( queryData, { $set : { feedback: body.feedback } }, { projection: { secret:0 }, returnOriginal: false } );

  const response = {
    statusCode: 200,
    headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST,GET,PUT"
        },
    body: JSON.stringify(feedback.value? feedback.value : {"error": "request error", "message": "Invalid Id or secret"}),
  };

  return response;
};
