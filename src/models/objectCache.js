class ObjectCache {
  constructor() {
    this.objects = {};
  }

  add(obj, key) {
    if(key) {
      this.objects[key] = obj;
    } else {
      this.objects[obj.id] = obj;
    }
  }

  get(key) {
    return this.objects[key];
  }
}