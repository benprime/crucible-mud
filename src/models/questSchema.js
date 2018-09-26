import mongoose from 'mongoose';

export default new mongoose.Schema({
  name: [String], //"Bringing home the bacon"
  synopsis: [String], //"Your mom needs more bacon to cook breakfast tommorow"
  steps: [this], //1) Find a pig 2) Kill a pig 3) Collect meat from pig 4) Bring bacon home
  currentStep: Number, //2) Kill a pig
  success: {
    actionType: [String], //2) Complete quest step
    target: [String], //step 4
    message: [String],  //"Congratulations, you now get to have bacon for breakfast!"
    reward: [String], //"10 xp"
  },
});

/*  Example quest step (steps are just sub quests)

Step 2 from above: Kill a pig

Name: "Kill a pig"
Synopsis: "Find a meat source"
Steps: 1) Kill pig
Current Step: 1
Success:
  Action: Kill something
  Target: Pig
  Message: "Success"
  Reward: "2 xp"

*/

//After quests complete a step, auto advance to next step
