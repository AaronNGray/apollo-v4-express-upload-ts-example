// @ts-check

import { pathToFileURL } from "node:url";

export default new URL("./uploads/", pathToFileURL(__dirname));
