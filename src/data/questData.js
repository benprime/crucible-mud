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

const QuestStatusTypes = {
  Completed: 'completed',
  Failed: 'failed',
  InProgress: 'in progress',
};

export default {
  catalog: [
    {
      name: 'Bringing home the bacon',
      synopsis: 'Your mom needs more bacon to cook breakfast tommorow',
      steps: [],
      currentStep: 0,
      status: QuestStatusTypes.InProgress,
      success: {
        actionType: ActionTypes.Fetch,
        target: 'pork belly',
        message: 'Congratulations, you now get to have bacon for breakfast!',
        reward: {
          type: RewardTypes.XP,
          amount: 100,
        },
      },
    },
  ],
};