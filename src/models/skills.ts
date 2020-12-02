import { prop } from "@typegoose/typegoose";

class SkillsDocument {
  @prop()
  stealth: number; // ability to not be seen/heard (DEX)

  @prop()
  lockpick: number; // open non-magical locks (DEX)

  @prop()
  pickpocket: number; // steal from others (DEX)


  // combine to perception
  @prop()
  search: number; // visual (hidden door, trap, etc) (INT)

  @prop()
  listen: number; // auditory (sounds beyond door, wind outside cave entrance, etc) (INT)

  @prop()
  detect: number; // magical (active spell, illusion, etc) (INT/WIL)

  //unarmed?
  @prop()
  identify: number; // determine hidden qualities of objects (INT)

  @prop()
  disable: number; // eliminate traps (DEX)

  @prop()
  negotiate: number; // make deals with others (CHA)

  @prop()
  bluff: number; // mislead/swindle others (CHA)

  @prop()
  intimidate: number; // force others to comply through fear (STR/CHA)

  @prop()
  magic: number; // affinity/skill with magic (INT/WIL)

  @prop()
  weapons: number; // affinity/skill with weapons (STR/DEX) // subweapon skills? (dual, ranged, one hand, two hand, pierce, slash, bludge)

  @prop()
  conceal: number; // hide objects (DEX)

  @prop()
  heal: number; // minor self heal (CON)

  @prop()
  refresh: number; // minor self revitalization of energy (WIL)

  @prop()
  endure: number; // survive what others cannot (resist poison, no KO, etc) (CON)

  @prop()
  resist: number; // shield from magic (resist spell, see through illusion/charm, etc) (WIL)
}

export { SkillsDocument };
