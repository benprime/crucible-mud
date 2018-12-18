const ActionTypes = {
  Choice: 'choice',
  Equip: 'equip',
  Kill: 'kill',
  Moxie: 'moxie',
  Move: 'move',
  Skill: 'skill',
};

const RewardTypes = {
  XP: 'xp',
  Currency: 'currency',
  Item: 'item',
};

export default {
  catalog: [
    {
      name: 'Bringing home the bacon',
      synopsis: 'Your mom needs more bacon to cook breakfast tommorow',
      steps: [],
      currentStep: 0,
      success: {
        actionType: ActionTypes.Kill,
        target: 'pig',
        message: 'Congratulations, you now get to have bacon for breakfast!',
        reward: {
          type: RewardTypes.XP,
          amount: 100,
        },
      },
    },
  ],
};