import request from '../../utils/request';

// 一卡通登录
export const yktLogin = (cookie) => {
  return request.post("/Card/login",
    {
      cookie
    },
  );
}

// 获取余额
export const getAccWallet = (AccNum) => {
  return request.post("/Card/getAccWallet", { AccNum })
}

// 获取一卡通流水信息
export const getDealRec = (data)=>{
  return request.post("/Card/getDealRec", data)
}