import _func from "@/func/main";

let func = {
  road: [
    {
      id: 1,
      start: 0,
      list: [
        {
          data: 118,
          offset: 0.001,
          act: '+'
        },
        {
          data: 35,
          offset: 0.001,
          act: '+'
        }
      ],
      status: 'working'
    },
    {
      id: 2,
      start: 10,
      list: [
        {
          data: 118.3,
          offset: 0.001,
          act: '+'
        },
        {
          data: 35.9,
          offset: 0.001,
          act: '-'
        }
      ],
      status: 'working'
    },
    {
      id: 3,
      start: -20,
      list: [
        {
          data: 117,
          offset: 0.003,
          act: '+'
        },
        {
          data: 36,
          offset: 0.001,
          act: '-'
        }
      ],
      status: 'working'
    }
  ]
};
let maxnum = 100;
let _push = {
  num: 0,
  do: false
}
func.count = function(data, act, offset, index) {
  if (act == '+') {
    return data + offset * index;
  } else if (act == '-') {
    return data + offset * index;
  }
}
func.GetRoad = function () {
  return new Promise((resolve, reject) => {
    let res = {
      status: 'success',
      data: {
        list: []
      }
    }
    for (let i = 0; i < this.road.length; i++) {
      res.data.list.push(this.GetItemById(this.road[i].id));
    }
    resolve(res);
  });
};
func.GetUpdate = function () {
  return new Promise((resolve, reject) => {
    let res = {
      status: 'success',
      data: {
        list: []
      }
    }
    for (let i = 0; i < this.road.length; i++) {
      res.data.list.push(this.GetItemById(this.road[i].id));
    }
    if (!_push.do) {
      _push.num++;
      if (_push.num > 3) {
        _push.do = true;
        this.road.push({
          id: 4,
          start: -200,
          list: [
            {
              data: 118,
              offset: 0.002,
              act: '+'
            },
            {
              data: 36,
              offset: 0.004,
              act: '-'
            }
          ],
          status: 'unwork'
        });
      }
    }
    resolve(res);
  });
};
func.GetItem = function (id) {
  return new Promise((resolve, reject) => {
    let res = {
      status: 'success',
      data: this.GetItemById(id)
    }
    resolve(res);
  });
};
func.GetItemById = function (id) {
  let data;
  for (let i = 0; i < this.road.length; i++) {
    if (id == this.road[i].id) {
      data = {
        id: this.road[i].id,
        name: i,
        list: [],
        status: this.road[i].status
      };
      for (let k = 0; k < maxnum; k++) {
        let item = {
          position: [],
          status: k < this.road[i].start ? 'worked' : 'unwork'
        };
        item.position[0] = this.count(this.road[i].list[0].data, this.road[i].list[0].act, this.road[i].list[0].offset, k);
        item.position[1] = this.count(this.road[i].list[1].data, this.road[i].list[1].act, this.road[i].list[1].offset, k);
        data.list.push(item);
      }
      if (this.road[i].start >= maxnum) {
        this.road[i].start = maxnum;
        this.road[i].status = 'worked';
      } else {
        if (this.road[i].start <= 0) {
          this.road[i].status = 'unwork';
        } else {
          this.road[i].status = 'working';
        }
        this.road[i].start = this.road[i].start + _func.getrandom(1, 20);
      }
      return data;
    }
  }
};



export default func;