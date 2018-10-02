/**
 * Dictionary of successfully validated and loaded Actions.
 */
export const actions = {};

/**
 * 
 * @param {Object} actionModule
 * @param {String} file 
 */
function validateAction(actionModule) {
  if (!actionModule) throw 'null ActionModule passed to validateAction';
  if (!actionModule.name) throw `Action ${actionModule.name} missing name!`;
  if (!actionModule.execute) throw `Action ${actionModule.name} missing execute!`;
}

function loadActions(actionModules) {
  actionModules.forEach(actionModule => {
    if (Object.values(actions).includes(actionModule)) {
      throw 'Action already loaded!';
    }
    validateAction(actionModule, actionModule.name);
    actions[actionModule.name] = actionModule;
  });
}

export default {
  actions,
  loadActions,
};