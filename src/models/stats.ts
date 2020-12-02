import { prop } from "@typegoose/typegoose";

class StatsDocument {
    @prop()
    strength: number;

    @prop()
    intelligence: number;

    @prop()
    dexterity: number;

    @prop()
    charisma: number;

    @prop()
    constitution: number;

    @prop()
    willpower: number;
  }

  export {StatsDocument};