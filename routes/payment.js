var express = require('express');
var router = express.Router();
const opay_payment =require('../node_modules/opay_payment_nodejs/lib/opay_payment')
const GetPayment = require('../controllers/get_controller');
const ModifyPayment = require('../controllers/modify_controller');

getPayment = new GetPayment();
modifyPayment = new ModifyPayment();

// 用戶進入付款頁面所呼叫的API
router.get('/payment', getPayment.payUid);
const randomValue = function (min, max) {
    return Math.round(Math.random() * (max - min) + min);
}
const onTimeValue = function () {
    var date = new Date();
    var mm = date.getMonth() + 1;
    var dd = date.getDate();
    var hh = date.getHours();
    var mi = date.getMinutes();
    var ss = date.getSeconds();

    return [date.getFullYear(), "/" +
        (mm > 9 ? '' : '0') + mm, "/" +
        (dd > 9 ? '' : '0') + dd, " " +
        (hh > 9 ? '' : '0') + hh, ":" +
        (mi > 9 ? '' : '0') + mi, ":" +
        (ss > 9 ? '' : '0') + ss
    ].join('');
};
router.get('/payment1', (req, res) => {
    let uid = randomValue(10, 99) + "1234567890234567" + randomValue(10, 99);
    // 使用opay_payment SDK進行金流串接
    const base_param = {
        MerchantTradeNo: uid, //請帶20碼uid, ex: f0a0d7e9fae1bb72bc93
        MerchantTradeDate: onTimeValue(), //ex: 2017/02/13 15:45:30
        TotalAmount: '100',
        TradeDesc: '企鵝玩偶 一隻',
        ItemName: '企鵝玩偶 300元 X 1',
        ReturnURL: 'https://48dc-220-132-127-90.ngrok-free.app', // 付款結果通知URL
        OrderResultURL: 'https://48dc-220-132-127-90.ngrok-free.app', // 在使用者在付款結束後，將使用者的瀏覽器畫面導向該URL所指定的URL
        EncryptType: 1,
        // ItemURL: 'http://item.test.tw',
        Remark: '該服務繳費成立時，恕不接受退款。',
        // HoldTradeAMT: '1',
        // StoreID: '',
        // UseRedeem: ''
    };

    const create = new opay_payment();
    const parameters = {};
  
    try {
        const htm = create.payment_client.aio_check_out_credit_onetime(base_param);
        res.render('payment', { result: htm });
    } catch (err) {
      console.log(err);
      res.render('error', { message: err });
    }
  });

// 用戶在付款頁面按下結帳的API
router.get('/paymentaction', getPayment.payAction);

// 銜接歐付寶的Return_URL回來的資料
router.post('/payment', modifyPayment.paymentResult);

// 銜接歐付寶的OrderResultURL
router.post('/paymentactionresult', modifyPayment.paymentActionResult);

module.exports = router;