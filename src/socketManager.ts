import { Connection } from "mongoose";

let db: Connection;

function setGlobals(p_db: Connection) {
    db = p_db;
}

export {db, setGlobals}