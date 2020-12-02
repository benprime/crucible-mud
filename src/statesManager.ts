import { SocketExt } from "./core/socketUtil";

export abstract class StatesManager {
  //============================================================================
  // Character States - this may get moved to a sub-schema
  //============================================================================
  public static setState(socket: CharacterModel, state) {
    if (!Object.values(characterStates).includes(state)) {
      return;
    }
    if (!this.stats.includes(state)) {
      this.stats.push(state);
      this.updateHUD();
      return true;
    }
    return;
  };

  public static hasState(socket: SocketExt, state) {
    return this.stats.includes(state);
  };

  public static removeState(socket: SocketExt, state) {
    if (!Object.values(characterStates).includes(state)) {
      return;
    }

    const sIndex = this.stats.findIndex(s => s === state);
    if (sIndex > -1) {
      const removed = this.stats.splice(sIndex, 1);
      this.updateHUD();
      return removed;
    }

    return;
  };

  public static sneakMode(this: DocumentType<CharacterDocument>) {
    return this.hasState(characterStates.SNEAKING);
  };

  public update(this: DocumentType<CharacterDocument>) {
    this.stats.forEach(cs => {
      if (cs.update) {
        cs.update(this);
      }
    });
  };

  /**
   * Checks if a command being executed affects a character's current states.
   * @param {Character} character
   * @param {Object} command
   * @returns {Boolean} - Whether or not the command can continue.
   */
  public static processStates(this: DocumentType<CharacterDocument>, actionCategory): boolean {

    // if any state restricts the action, we will let that trump deactivating other states.
    // For this reason, we must check all states for action prevention first.
    const restrictStates = this.stats.filter(s => s.mode === stateMode.RESTRICT);
    for (let state of restrictStates) {
      if (!state.actionCategories.includes(actionCategory)) {
        if (state.message) {
          // treat a regular string as a template literal
          const msg = new Function(`return \`${state.message}\`;`).call(this);
          this.output(msg);
        }

        // since the action is blocked, we can return immediately
        return false;
      }
    }

    // multiple states can be deactivated in one action, so we must loop through
    // entire array and remove states as they become deactivated.
    const deactivateStates = this.stats.filter(s => s.mode === stateMode.DEACTIVATE);
    for (let i = 0; i < deactivateStates.length; i++) {
      let state = deactivateStates[i];

      if (!state.actionCategories.includes(actionCategory)) {
        if (state.message) {
          let msg = new Function(`return \`${state.message}\`;`).call(this);
          this.output(msg);
        }
        deactivateStates.splice(i, 1);
        i--;
        this.removeState(state);
      }
    }

    this.updateHUD();
    return true;
  };
}


