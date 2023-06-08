const express = require('express');
const router = express.Router();
const sampleData = require('../sample');
const axios = require('axios');
// const crypto = require('crypto');
const Base64 = require('crypto-js/enc-base64');
const HmacSHA256 = require('crypto-js/hmac-sha256');
require('dotenv').config();
const { LINEPAY_CHANNEL_ID,
  LINEPAY_CHANNEL_SECRET_KEY,
  LINEPAY_VERSION,
  LINEPAY_SITE,
  LINEPAY_RETURN_HOST,
  LINEPAY_RETURN_CONFIRM_URL,
  LINEPAY_RETURN_CANCEL_URL } = process.env;
const orders = {};

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/checkout/:id', (req, res) => {
  const { id } = req.params;
  const order = sampleData[id];
  const orderId = parseInt(new Date().getTime() / 1000);
  order.orderId = orderId;
  orders[order.orderId] = order
  res.render('checkout', { order });
});
router.post('/linePay/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const order = orders[orderId];
  try {
    const reqsBody = {
      ...order,
      redirectUrls: {
        confirmUrl: `${LINEPAY_RETURN_HOST}${LINEPAY_RETURN_CONFIRM_URL}`,
        cancelUrl: `${LINEPAY_RETURN_HOST}${LINEPAY_RETURN_CANCEL_URL}`
      },
    }
    const uri = '/payments/request';
    const url = `${LINEPAY_SITE}/${LINEPAY_VERSION}${uri}`;
    const nonce = new Date().getTime();
    const encrypt = HmacSHA256(
      `${LINEPAY_CHANNEL_SECRET_KEY}/${LINEPAY_VERSION}${uri}${JSON.stringify(
        reqsBody,
      )}${nonce}`,
      LINEPAY_CHANNEL_SECRET_KEY,
    );
    const signature = Base64.stringify(encrypt);
    const headers = {
      "Content-Type": "application/json",
      'X-LINE-ChannelId': LINEPAY_CHANNEL_ID,
      'X-LINE-Authorization-Nonce': nonce,
      'X-LINE-Authorization': signature,
    }
    const linepayres = await axios.post(url, reqsBody, { headers })
    console.log(linepayres);
    if (linepayres.data.returnCode === '0000') {
      res.redirect(linepayres.data.info.paymentUrl.web);
    } else {
      res.status(400).send({
        message: '訂單不存在',
      });
    }
  } catch (error) {
    console.log(error)
    res.end();
  }
});
router.get('/linePay/confirm', async (req, res) => {
  const { transactionId, orderId } = req.query;
  const order = orders[orderId];

  try {
    // 建立 LINE Pay 請求規定的資料格式
    const uri = `/payments/${transactionId}/confirm`;
    const linePayBody = {
      amount: order.amount,
      currency: 'TWD',
    }

    // CreateSignature 建立加密內容
    const nonce = new Date().getTime();
    const encrypt = HmacSHA256(
      `${LINEPAY_CHANNEL_SECRET_KEY}/${LINEPAY_VERSION}${uri}${JSON.stringify(
        linePayBody,
      )}${nonce}`,
      LINEPAY_CHANNEL_SECRET_KEY,
    );
    const signature = Base64.stringify(encrypt);
    const headers = {
      "Content-Type": "application/json",
      'X-LINE-ChannelId': LINEPAY_CHANNEL_ID,
      'X-LINE-Authorization-Nonce': nonce,
      'X-LINE-Authorization': signature,
    }
    // API 位址
    const url = `${LINEPAY_SITE}/${LINEPAY_VERSION}${uri}`;
    const linePayRes = await axios.post(url, linePayBody, { headers });
    console.log(linePayRes);

    // 請求成功...
    if (linePayRes?.data?.returnCode === '0000') {
      res.render('success', { order })
    } else {
      res.status(400).send({
        message: linePayRes,
      });
    }
  } catch (error) {
    console.log(error);
    // 各種運行錯誤的狀態：可進行任何的錯誤處理
    res.end();
  }
});
router.get('/pa', (req, res) => {
  res.render('aa')
})
const crypto = require('crypto');
const generateCheckMacValue = (data, hashKey, hashIV) => {
  const keys = Object.keys(data).sort(); let checkValue = '';
  for (const key of keys) { checkValue += `${key}=${data[key]}&` }
  checkValue = `HashKey=${hashKey}&${checkValue}HashIV=${hashIV}`; // There is already an & in the end of checkValue
  checkValue = encodeURIComponent(checkValue).toLowerCase();
  checkValue = checkValue.replace(/%20/g, '+')
    .replace(/%2d/g, '-')
    .replace(/%5f/g, '_')
    .replace(/%2e/g, '.')
    .replace(/%21/g, '!')
    .replace(/%2a/g, '*')
    .replace(/%28/g, '(')
    .replace(/%29/g, ')')
    .replace(/%20/g, '+');

  checkValue = crypto.createHash('sha256').update(checkValue).digest('hex');
  checkValue = checkValue.toUpperCase();
  return checkValue;
}
const randomValue = function (min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

let uid = randomValue(10, 99) + "1235567820234567" + randomValue(10, 99);
const ecpay_payment = require('../node_modules/ECPAY_Payment_node_js/lib/ecpay_payment')
router.get('/pay/pay', async (req, res) => {
    const base_param = {
      TradeDesc: "促銷方案",
      PaymentType: "aio",
      MerchantTradeDate: "2013/03/12 15:30:23",
      MerchantTradeNo: uid,
      MerchantID: '2000132',
      ReturnURL: "https://0c3b-220-132-127-90.ngrok-free.app/pa",
      ItemName: "Apple iphone 7 手機殼",
      TotalAmount: 1000,
      ChoosePayment: "ALL",
      EncryptType: '1'
    }
  const options = require('../node_modules/ECPAY_Payment_node_js/conf/config-example'),
  create = new ecpay_payment(options)
    try {
    htm = create.payment_client.aio_check_out_credit_onetime( base_param)
    console.log(base_param)
    res.render('payment',{result: htm});
  } catch (error) {
    console.log(error)
    res.render('error', { message: error });
  }

})

router.post('/pa',(req,res)=>{
    var rtnCode = req.body.RtnCode;
    var simulatePaid = req.body.SimulatePaid;
    var merchantID = req.body.MerchantID;
    var merchantTradeNo = req.body.MerchantTradeNo;
    var storeID = req.body.StoreID;
    var rtnMsg = req.body.RtnMsg;
    // var tradeNo = req.body.TradeNo;
    var tradeAmt = req.body.TradeAmt;
    // var payAmt = req.body.PayAmt;
    var paymentDate = req.body.PaymentDate;
    var paymentType = req.body.PaymentType;
    // var paymentTypeChargeFee = req.body.PaymentTypeChargeFee;

    let paymentInfo = {
        merchantID: merchantID,
        merchantTradeNo: merchantTradeNo,
        storeID: storeID,
        rtnMsg: rtnMsg,
        paymentDate: paymentDate,
        paymentType: paymentType,
        tradeAmt: tradeAmt
    }
    console.log(paymentInfo)

    //(添加simulatePaid模擬付款的判斷 1為模擬付款 0 為正式付款)
    //測試環境
    if (rtnCode === "1" && simulatePaid === "1") {
        // 這部分可與資料庫做互動
        res.write("1|OK");
        res.end();
    }
    //正式環境
    //  else if (rtnCode === "1" && simulatePaid === "0") {
    // 這部分可與資料庫做互動
    // } 
    else {
        res.write("0|err");
        res.end();
    }
})
module.exports = router;
