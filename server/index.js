import dotenv from "dotenv";
dotenv.config();
BigInt.prototype.toJSON = function () {
  return this.toString();
};

import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
