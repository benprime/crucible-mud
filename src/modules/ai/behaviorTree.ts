const NodeTypes = {
  ACTION: 'action',
  SEQUENCE: 'sequence',
  SELECTOR: 'selector',
};

class BehaviorTreeAction {
	public type: any;
	public action: any;

  constructor(actionObj) {
    this.type = NodeTypes.ACTION;
    this.action = actions[actionObj.name];
  }

  execute() {
    // should this always be set?
    if (this.action) {
      return this.action();
    }
  }
}

class BehaviorTreeSelector {
	public type: any;
	public nodes: any;

  constructor() {
    this.type = NodeTypes.SELECTOR;
  }

  execute() {
    let result = false;
    for (let node of this.nodes) {
      result = node.execute();
      if (result) return result;
    }
    return result;
  }
}

class BehaviorTreeSequence {
	public type: any;
	public nodes: any;

  constructor() {
    this.type = NodeTypes.SEQUENCE;
  }

  execute() {
    let result = true;
    for (let node of this.nodes) {
      result = node.execute();
      if (!result) return result;
    }
    return result;
  }
}

function buildNode(rawNode) {
  let node;
  switch (rawNode.type) {
    case NodeTypes.SEQUENCE:
      node = new BehaviorTreeSequence(rawNode);
      break;
    case NodeTypes.SELECTOR:
      node = new BehaviorTreeSelector(rawNode);
      break;
    case NodeTypes.ACTION:
      node = new BehaviorTreeAction(rawNode);
      break;
    default:
      throw `invalid node type: ${rawNode.type}`;
  }

  if (Array.isArray(rawNode.nodes)) {
    node.nodes = rawNode.nodes.map(rn => buildNode(rn, node));
  }

  return node;
}

let tree = {
  type: 'sequence',
  nodes: [
    // Read initial conditions
    { type: 'action', name: 'initialize' },
    // Either enter or abandon
    {
      type: 'selector',
      nodes: [
        // Try various methods to open the door
        {
          type: 'sequence',
          nodes: [
            {
              type: 'selector',
              nodes: [
                { type: 'action', name: 'door.isOpen' }, // Check if door is already open
                {
                  type: 'sequence',
                  nodes: [
                    { type: 'action', name: 'door.open' },
                    { type: 'action', name: 'door.isOpen' },
                  ]
                }
              ],
            }]
        },
        {
          type: 'sequence',
          nodes: [
            { name: 'door.unlock', type: 'action' },
            { name: 'door.open', type: 'action' },
            { name: 'door.isOpen', type: 'action' }
          ],
        }, // If failed, try to unlock the door, then open
        {
          type: 'sequence', nodes: [
            { name: 'door.kick', type: NodeTypes.ACTION },
            { name: 'door.isOpen', type: NodeTypes.ACTION }
          ]
        }, // If failed, try to kick the door
      ],
    },
    // Enter the room
    { type: 'action', name: 'room.moveInto' },
    // Could not open the door, must abandon the plan of entering this room
    { type: 'action', name: 'room.abandon' },
  ],
};


const actions = {
  'initialize': function () {
    console.log('initialized called');
    return true;
  },
  'door.isOpen': function () {
    console.log('door.isOpen called');
    return false;
  },
  'door.open': function () {
    console.log('door.open called');
    return false;
  },
  'door.unlock': function () {
    console.log('door.unlock called');
    return true;
  },
  'door.kick': function () {
    console.log('door.kick called');
    return true;
  },
  'room.moveInto': function () {
    console.log('room.moveInto called');
    return true;
  },
  'room.abandon': function () {
    console.log('room.abandon called');
    return true;
  },
};


class BehaviorTree {
	public _tree: any;

  constructor(treeData) {
    this._tree = buildNode(treeData);
  }

  execute() {
    if (Array.isArray(this._tree.nodes)) {
      for (let node of this._tree.nodes)
        if (!node.execute()) {
          return false;
        }

    }
  }
}


var builtTree = new BehaviorTree(tree);
builtTree.execute();

console.log('done');