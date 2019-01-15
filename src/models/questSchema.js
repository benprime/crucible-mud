import mongoose from 'mongoose';

var QuestSchema = new mongoose.Schema({
  name: [String], //"Bringing home the bacon"
  synopsis: [String], //"Your mom needs more bacon to cook breakfast tommorow"
  currentStep: Number, //2) Kill a pig  - this will be marked elsewhere
  success: {
    actionType: [String], //2) Complete quest step
    target: [String], //step 4
    message: [String],  //"Congratulations, you now get to have bacon for breakfast!"
    reward: {
      type: [String],
      amount: [Number], //"10 xp"
    }, 
  },
});

QuestSchema.add({steps: [QuestSchema]}); //1) Find a pig 2) Kill a pig 3) Collect meat from pig 4) Bring bacon home

QuestSchema.methods.isComplete = function(character) {
  if(this.success.actionType === 'fetch') {
    return character.inventory.findIndex(item => item.name === this.success.target) !== -1;
  }
};

export default QuestSchema;
/* Example quest step (steps are just sub quests)

Step 2 from above: Kill a pig

Name: "Kill a pig"
Synopsis: "Find a meat source"
Steps: 1) Kill pig
//Current Step: 1
Success:
  Action: Kill something
  Target: Pig
  Message: "Success"
  Reward: "2 xp"

*/

//After quests complete a step, auto advance to next step
