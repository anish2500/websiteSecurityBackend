import { connectDatabase } from "./database/mongodb";
import app from "./app";
import { MONGODB_URI, PORT } from "./config";
async function start(){
    await connectDatabase();

    app.listen(PORT, ()=>{
    console.log(`Server: http://localhost:${PORT}`);
    console.log(MONGODB_URI);
    }); // added closing brace here
}

start().catch((error) => console.log(error));