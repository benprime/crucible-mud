
import BehaviorTree from './behaviorTree';

class AiScript{
	public state: any;
	public tree: any;

  constructor(treeData) {
    this.state = {};
    this.tree = new BehaviorTree(treeData);
  }
  
}