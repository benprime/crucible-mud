import { upperCaseWords, indefiniteArticle, pronounSubject, pronounPossessive, oxfordComma } from '../core/language';
import { prop, getModelForClass, ReturnModelType, DocumentType } from '@typegoose/typegoose';
import { ItemDocument } from './item';


class CharacterEquipDocument {
  @prop()
  weaponMain: string;

  @prop()
  weaponOff: string;

  // Armor/Gear
  @prop()
  head: string;

  @prop()
  body: string;

  @prop()
  back: string;

  @prop()
  legs: string;

  @prop()
  feet: string;

  @prop()
  arms: string;

  @prop()
  hands: string;

  @prop()
  neck: string;

  @prop()
  fingerMain: string;

  @prop()
  fingerOff: string;

  public static slotNames(this: ReturnModelType<typeof CharacterEquipDocument>): string[] {
    return Object.keys(this.schema.paths).filter(i => i !== '_id');
  }

  public async unequip(this: DocumentType<CharacterEquipDocument>, item: DocumentType<ItemDocument>) {
    if (!item || !this.isEquipped(item)) {
      return;
    }
    this.unequipSlotsForItem(item);
  }

  public async unequipSlotsForItem(this: DocumentType<CharacterEquipDocument>, item: DocumentType<ItemDocument>) {
    const itemIds = [];
    item.equipSlots.forEach(slot => {
      let equippedItemId = this[slot];
      if (equippedItemId) {
        this.unequipItemById(equippedItemId);
        itemIds.push(equippedItemId);
      }
    });
  }

  public async unequipItemById(this: DocumentType<CharacterEquipDocument>, itemId) {
    CharacterEquipModel.slotNames().forEach(key => {
      if (this[key] === itemId) {
        this[key] = null;
      }
    });
  };

  public async isEquipped(this: DocumentType<CharacterEquipDocument>, item: DocumentType<ItemDocument>) {
    for (let slot of CharacterEquipModel.slotNames()) {
      if (this[slot] === item.id) {
        return true;
      }
    }
    return false;
  };

  public async equip(this: DocumentType<CharacterEquipDocument>, item: DocumentType<ItemDocument>) {

    if (this.isEquipped(item)) {
      //this.$parent.output(`${item.name} already equipped.`);
      return;
    }

    this.unequipSlotsForItem(item);
    item.equipSlots.forEach(slot => this[slot] = item.id);
    //this.$parent.output(`${item.name} equipped.`);

    if (['weaponMain', 'weaponOff'].includes(item.equipSlots[0])) {
      //this.$parent.toRoom(`${this.$parent.name} is now wielding ${indefiniteArticle(item.name)} ${item.name}.`);
    } else {
      //this.$parent.toRoom(`${this.$parent.name} wears ${item.name}.`);
    }
  };

  public async unequipAll(this: DocumentType<CharacterEquipDocument>, ) {
    CharacterEquipModel.slotNames().forEach(slotName => this[slotName] = undefined);
  };

  public async weaponName(this: DocumentType<CharacterEquipDocument>, weaponId) {
    //const weapon = this.$parent.inventory.id(weaponId);
    return 'TODO: make weapon name work'
    //return weapon ? weapon.name : '';
  };

  public getDesc(this: DocumentType<CharacterEquipDocument>): string {

    const output = [];

    //let pSubject = pronounSubject(this.$parent.gender);
    let pSubject = 'he';
    let upSubject = upperCaseWords(pSubject);
    let upObject = upperCaseWords(pSubject);
    //let pPossessive = pronounPossessive(this.$parent.gender);
    let pPossessive = 'his';

    const weaponMainName = this.weaponName(this.weaponMain) || '';
    const weaponOffName = this.weaponName(this.weaponOff) || '';

    const headName = this.weaponName(this.head) || '';
    const bodyName = this.weaponName(this.body) || '';
    const backName = this.weaponName(this.back) || '';
    const legsName = this.weaponName(this.legs) || '';
    const feetName = this.weaponName(this.feet) || '';
    const armsName = this.weaponName(this.arms) || '';
    const handsName = this.weaponName(this.hands) || '';
    const neckName = this.weaponName(this.neck) || '';
    const fingerMain = this.weaponName(this.fingerMain) || '';
    const fingerOff = this.weaponName(this.fingerOff) || '';

    // weapons
    let weaponOutput = upObject;
    if (weaponMainName || weaponOffName) {
      weaponOutput += ' is holding ';
      if (weaponMainName) weaponOutput += `${indefiniteArticle(weaponMainName)} ${weaponMainName}`;
      if (weaponMainName && weaponOffName && weaponMainName !== weaponOffName) weaponOutput += ' and ';
      if (weaponOffName && weaponMainName !== weaponOffName) weaponOutput += `${indefiniteArticle(weaponOffName)} ${weaponOffName}`;
    } else {
      weaponOutput += ' is unarmed';
    }
    weaponOutput += '.';
    output.push(weaponOutput);

    // headwear
    if (headName) output.push(`On ${pPossessive} head ${pSubject} wears ${indefiniteArticle(headName)} ${headName}.`);

    // upper body
    const body = [];
    if (bodyName) body.push(bodyName);
    if (armsName) body.push(armsName);
    if (handsName) body.push(handsName);
    if (legsName) body.push(legsName);
    if (feetName) body.push(feetName);

    if (body.length > 0) {
      const bodyString = oxfordComma(body);
      output.push(`${upObject} is wearing ${bodyString}.`);
    }

    // back
    if (backName) output.push(`${upperCaseWords(indefiniteArticle(headName))} ${backName} falls behind him.`);

    // jewelery
    let jewelery = [];
    if (neckName) jewelery.push(neckName);
    if (fingerMain) jewelery.push(fingerMain);
    if (fingerOff) jewelery.push(fingerOff);

    if (jewelery.length > 0) {
      jewelery = jewelery.map(s => s = `${indefiniteArticle(s)} ${s}`);
      const jeweleryString = oxfordComma(jewelery);
      output.push(`${upSubject} is adorned with ${jeweleryString}.`);
    }

    return output.join(' ');
  };

}

const CharacterEquipModel = getModelForClass(CharacterEquipDocument);

export { CharacterEquipModel, CharacterEquipDocument };

//{schemaOptions: { usePushEach: true, id: false, _id: false }}
