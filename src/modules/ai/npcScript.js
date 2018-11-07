
import BehaviorTree from './behaviorTree';

class AiScript{

  constructor(treeData) {
    this.state = {};
    this.tree = new BehaviorTree(treeData);
  }
  
}