const express = require('express');  
var router = express.Router();
var DB = require('../mysql');
const xlsx = require('node-xlsx');
const excel = require('node-excel-export');
const fs = require('fs');

// excel下载downLoad
// router.get('/getexcel', function(req, res){
//   // let dataset = await
//   let dataset;
//   let name = req?.query?.name;
//    DB.query('SELECT * FROM HTE', [name],(err, rows) =>{
//      dataset = rows;
//     })
//     console.log('aaaaaa', name ,dataset);
//       const styles = {
//         headerNormal: {
//             fill: {
//                 fgColor: {
//                     rgb: 'dd4b39'
//                 }
//             },
//             border: {
//                 top: { style: 'thin', color: '000000' },
//                 bottom: { style: 'thin', color: '000000' },
//                 left: { style: 'thin', color: '000000' },
//                 right: { style: 'thin', color: '000000' }
//             },
//             font: {
//                 bold: true,
//                 sz: 11,
//                 color: {
//                     rgb: 'ffffff'
//                 }
//             }
//         },
//         cellNormal: {
//             fill: {
//                 fgColor: {
//                     rgb: 'FFFFFF'
//                 }
//             },
//             border: {
//                 top: { style: 'thin', color: '000000' },
//                 bottom: { style: 'thin', color: '000000' },
//                 left: { style: 'thin', color: '000000' },
//                 right: { style: 'thin', color: '000000' }
//             },
//             font: {
//                 sz: 10
//             }
//         },
//         cellRed: {
//             // fill: {
//             //     fgColor: {
//             //         rgb: 'ff0000'
//             //     }
//             // }
//             border: {
//                 top: { style: 'thin', color: '000000' },
//                 bottom: { style: 'thin', color: '000000' },
//                 left: { style: 'thin', color: '000000' },
//                 right: { style: 'thin', color: '000000' }
//             },
//             font: {
//                 sz: 10,
//                 color: {
//                     rgb: 'ff0000'
//                 }
//             }
//         },
//     };
//     // excel列表头数据
//     const specification = {
//       ProteinID: {
//             displayName: ' ProteinID',
//             headerStyle: styles.headerNormal,
//             cellStyle: styles.cellNormal,
//             width: '13'
//         },
//         Genename: {
//             displayName: 'Genename',
//             headerStyle: styles.headerNormal,
//             // cellFormat: function(value, row) {
//             //     return (value == 1) ? '男' : '女';
//             // },
//             // cellStyle: function(value, row) {
//             //     return (row.sex== 1) ? styles.cellRed : styles.cellNormal;
//             // },
//             width: '12'
//         },
//         Position: {
//             displayName: 'Position',
//             headerStyle: styles.headerNormal,
//             // cellFormat: function(value, row) {
//             //     return value ? value : '-';
//             // },
//             // cellStyle: function(value, row) {
//             //     return (row.remark_bgground== 'red') ? styles.cellRed : styles.cellNormal;
//             // },
//             width: '16'
//         },
//     }
//     // excel配置
//     const report = excel.buildExport(
//         [ 
//             {
//                 name: 'Report', // <- Specify sheet name (optional)
//                 // heading: heading, // <- Raw heading array (optional)
//                 // merges: merges, // <- Merge cell ranges
//                 specification: specification, // <- Report specification
//                 data: dataset // <-- Report data
//             }
//         ]
//     );
//     res.attachment('下载表.xlsx');
//     res.send(report);

// })

/* POST search listing. */
router.post('/search', function(req, res, next) {
  console.log(req.body, '----------');
  const {data} = req.body;
  const {name, field, organisms, modifications} = data;
  // 链接mySQL数据库，将查询结果返回
  // DB.connect();
    // DB.query(`SELECT * FROM (HTE INNER JOIN HTE_anno ON HTE.ProteinID = HTE_anno.From)  WHERE HTE.${field} = ? and HTE.Organism = ? and HTE.Modification = ?`, [name,organisms,modifications], function(err, rows) {
    DB.query(`SELECT * FROM 
        (  HTE_PMID as m left join HTE as a on a.PMID=m.PMID left join HTE_anno as b on b.From=a.ProteinID left join HTE_GenID as c on c.From=b.From
        
        )  WHERE a.${field} = ? `, [name], function(err, rows) {
    if (err) {
      console.log(err);
    } else {
      console.log(rows, '数据库查询成功');
      res.send({list: rows, name, field, organisms, modifications});
      
    }
  })
  
  // DB.end();
});


/* POST browseChart listing. */
router.post('/browseChart', function(req, res, next) {
    console.log(req.body, '----------');
    const {data} = req.body;
    const {val} = data;
    // 链接mySQL数据库，将查询结果返回
    // DB.connect();
      // DB.query(`SELECT * FROM (HTE INNER JOIN HTE_anno ON HTE.ProteinID = HTE_anno.From)  WHERE HTE.${field} = ? and HTE.Organism = ? and HTE.Modification = ?`, [name,organisms,modifications], function(err, rows) {
               
      DB.query(`SELECT * FROM (HTE INNER JOIN HTE_anno ON HTE.ProteinID = HTE_anno.From )  WHERE HTE.Organism = ? `, [val], function(err, rows) {
      if (err) {
        console.log(err);
      } else {
        console.log(rows, '数据库查询成功');
        let obj = {};
        let obj2 = {};
        for(let i = 0; i < rows.length; i++ ){
            const {Modification, ProteinID, stress} = rows[i];
            if(!obj[Modification]){
                obj[Modification] = [ProteinID];
            }else{
                obj[Modification].push(ProteinID);
            }

            if(!obj2[stress]){
                obj2[stress] = [ProteinID];
            }else{
                obj2[stress].push(ProteinID)
            }
        }

        console.log(obj,'-------obj------',obj2);
        res.send({obj,obj2});
        
      }
    })
    
    // DB.end();
  });
  


  router.post('/Accsearch', function(req, res, next) {
    console.log(req.body, '----------');
    const {data} = req.body;
    const {field1,
      field2,
      name2,
      operator ,
      name1,
      organisms,
      modifications} = data;
    // 链接mySQL数据库，将查询结果返回
    // DB.connect();
      // DB.query(`SELECT * FROM (HTE INNER JOIN HTE_anno ON HTE.ProteinID = HTE_anno.From)  WHERE HTE.${field} = ? and HTE.Organism = ? and HTE.Modification = ?`, [name,organisms,modifications], function(err, rows) {
      let sql=`SELECT * FROM 
      (  HTE_PMID as m left join HTE as a on a.PMID=m.PMID left join HTE_anno as b on b.From=a.ProteinID left join HTE_GenID as c on c.From=b.From
      )`;
      let whereClause = '';  
      if (operator === 'and') {  
        whereClause = `WHERE a.${DB.escapeId(field1)} = ? AND a.${DB.escapeId(field2)} = ?`;  
      } else if (operator === 'or') {  
        whereClause = `WHERE a.${DB.escapeId(field1)} = ? OR a.${DB.escapeId(field2)} = ?`;  
      } else if (operator === 'and not') {  
        whereClause = `WHERE a.${DB.escapeId(field1)} = ? AND a.${DB.escapeId(field2)} IS NOT ?`;  
      }  
      sql += whereClause; 
      DB.query(sql, [name1, name2], function(err, rows) {  {
      if (err) {
        console.log(err);
      } else {
        console.log(rows, '数据库查询成功');
        res.send({list:rows});
        
      }
    }
    
    // DB.end();
  
  })
})



// download excels
router.post('/download', function(req, res, next) {
  DB.query('SELECT * FROM low_flux_anno', function(err, rows) {
    if (err) {
      console.log(err);
    } else {

      let data = [];
      //excel表头部分
      data.push([
        'id',
        'user',
        'password'
      ]);
      for(let i =0; i < rows.length; i++) {
        let arr = [];
        let value = rows[i];
        for(let j in value) {
          arr.push(value[j]);
        }
        data.push(arr);
      } 
      console.log(data, '----data');
      var buffer = xlsx.build([{name: "sheet1", data: data}]);
      fs.writeFileSync('./test.xlsx', buffer, {'flag': 'w'});
    }
  })
});


module.exports = router;



