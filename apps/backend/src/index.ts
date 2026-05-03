import dotenv from "dotenv";
import app from "./app";
import { testDb } from "./utils/testDb";
import { initResponseListener } from "./services/responseManager";

dotenv.config();

// const PORT = Number(process.env.PORT) || 3001;

// app.listen(PORT,() => {
//   console.log(`Server running on ${PORT}`);
// });

async function start() {
  console.log("Backend starting");

  //await testDb();
  await initResponseListener();

  const PORT = Number(process.env.PORT) || 3001;

  app.listen(PORT,() => {
    console.log(`Server running on ${PORT}`);
  });

}

start().catch((err) => {
  console.error("Backend failed to start:", err);
  process.exit(1);
});