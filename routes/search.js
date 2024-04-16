var express = require('express');
var router = express.Router();
var DB = require('../mysql');

/* POST search listing. */
// router.post('/', function(req, res, next) {
//   console.log(req.body, '----------');
//   const {data} = req.body;
//   const {name, field, organisms, modifications} = data;
//   // 链接mySQL数据库，将查询结果返回
//   // DB.connect();
//     // DB.query(`SELECT * FROM (HTE INNER JOIN HTE_anno ON HTE.ProteinID = HTE_anno.From)  WHERE HTE.${field} = ? and HTE.Organism = ? and HTE.Modification = ?`, [name,organisms,modifications], function(err, rows) {
//     DB.query(`SELECT * FROM (HTE INNER JOIN HTE_anno ON HTE.ProteinID = HTE_anno.From)  WHERE HTE.${field} = ? `, [name], function(err, rows) {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log(rows, '数据库查询成功');
//       res.send({list: rows, name, field, organisms, modifications});
      
//     }
//   })
  
//   // DB.end();
// });

module.exports = router;
