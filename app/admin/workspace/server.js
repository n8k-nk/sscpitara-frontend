import "server-only";

import { cache } from "react";
import { call } from "../../../lib/server";

export const getWorkspace = cache(() => call("admin/workspace"));
