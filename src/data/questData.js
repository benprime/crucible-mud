const ActionTypes = {
  Equip: 'equip',
  Kill: 'kill',
  Fetch: 'fetch',
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
        actionType: ActionTypes.Fetch,
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