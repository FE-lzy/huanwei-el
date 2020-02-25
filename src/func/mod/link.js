import router from '@/router'

let link = {

};

link.FuncLink = function (method, data) {
  if (method == 'router') {
    router.push(data);
  }
}


export default link;