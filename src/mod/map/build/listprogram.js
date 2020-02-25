class baseprogram {
  ExtData = {};
  list = [];
  PushData(item) {
    this.list.push(item);
  }
  ReList() {
    this.list = [];
  }
  GetList() {
    return this.list;
  }
  setExtData(data) {
    this.ExtData = data;
  }
  getExtData() {
    return this.ExtData;
  }
}

export default baseprogram;