const express = require('express');  
var router = express.Router();
var DBPool = require('../mysql');
const xlsx = require('node-xlsx');
const fs = require('fs');

// console.log(DBPool, 'DB----');
/* POST search listing. */
router.post('/search', function(req, res, next) {
  const {data} = req.body;
  const {name, field, organisms, modifications} = data;
  // 链接mySQL数据库，将查询结果返回
  // DB.connect();
  function sendMsg(rows){
    console.log('rows----函数的触发时机预期在数据库连接释放后');
    res.send({list: rows, name, field, organisms, modifications});
  }
  DBPool.getConnection((err,connection) => {
    if (err) {
      throw err; //不进行数据库连接
    }
      // DB.query(`SELECT * FROM (HTE INNER JOIN HTE_anno ON HTE.ProteinID = HTE_anno.From)  WHERE HTE.${field} = ? and HTE.Organism = ? and HTE.Modification = ?`, [name,organisms,modifications], function(err, rows) {
      connection.query(`SELECT * FROM 
          (  HTE_PMID as m left join HTE as a on a.PMID=m.PMID left join HTE_anno as b on b.From=a.ProteinID left join HTE_GenID as c on c.From=b.From)  WHERE a.${field} = ? `,
          
          [name], async function(err, rows) {
            if (err) {
              console.log(err);
            } else {
              console.log('数据库查询成功-----------rows');
              connection.release();
              console.log('数据库释放成功-----------release');
              // DBresult = rows;
              sendMsg(rows);
            }
          // DB.end();
         
        })
  })
  // console.log('数据库查询成功-----------DBresult', DBresult);
  // res.send({list: DBresult, name, field, organisms, modifications});
   
});


/* POST browseChart listing. */
router.post('/browseChart', function(req, res, next) {
    console.log(req.body, '----------');
    const {data} = req.body;
    const {val} = data;
    // let DBresult;
    // 链接mySQL数据库，将查询结果返回
    // DB.connect();
    function sendMsg(rows){
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
      console.log('发送相关数据----------');
      res.send({obj,obj2});
    }

    
    DBPool.getConnection((err,connection) => {
      if (err) {
        throw err; //不进行数据库连接
      }
      // DB.query(`SELECT * FROM (HTE INNER JOIN HTE_anno ON HTE.ProteinID = HTE_anno.From)  WHERE HTE.${field} = ? and HTE.Organism = ? and HTE.Modification = ?`, [name,organisms,modifications], function(err, rows) {
           
      connection.query(`SELECT * FROM (HTE INNER JOIN HTE_anno ON HTE.ProteinID = HTE_anno.From )  WHERE HTE.Organism = ? `,
      [val], function(err, rows) {
        if (err) {
          console.log(err);
        } else {
          console.log('数据库查询成功');
          // DBresult = rows;
           // DB.end();
          connection.release();
          console.log('数据库释放成功-------------release');
          sendMsg(rows);
        }
     
      })
    })

  });
  
  router.post('/searchname', function(req, res, next) {
    const {data} = req.body;
    const {val} = data;
    // 链接mySQL数据库，将查询结果返回
    // DB.connect();
    function sendMsg(rows){
      // console.log('rows----函数的触发时机预期在数据库连接释放后');
      res.send({list: rows,val});
    }
    DBPool.getConnection((err,connection) => {
      if (err) {
        throw err; //不进行数据库连接
      }
        // DB.query(`SELECT * FROM (HTE INNER JOIN HTE_anno ON HTE.ProteinID = HTE_anno.From)  WHERE HTE.${field} = ? and HTE.Organism = ? and HTE.Modification = ?`, [name,organisms,modifications], function(err, rows) {
        connection.query(`SELECT * FROM 
            (  HTE_PMID as m left join HTE as a on a.PMID=m.PMID left join HTE_anno as b on b.From=a.ProteinID left join HTE_GenID as c on c.From=b.From)  WHERE a.ProteinID =? `,
            
            [val], async function(err, rows) {
              if (err) {
                console.log(err);
              } else {
                console.log('数据库查询成功-----------rows1');
                connection.release();
                console.log('数据库释放成功-----------release1');
                // DBresult = rows;
                sendMsg(rows);
              }
          })
    })
    // console.log('数据库查询成功-----------DBresult', DBresult);
    // res.send({list: DBresult, name, field, organisms, modifications});
     
  });

  router.post('/Accsearch', function(req, res, next) {
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
    DBPool.getConnection((err,connection) => {
        if (err) {
          throw err; //不进行数据库连接
        }
        // DB.query(`SELECT * FROM (HTE INNER JOIN HTE_anno ON HTE.ProteinID = HTE_anno.From)  WHERE HTE.${field} = ? and HTE.Organism = ? and HTE.Modification = ?`, [name,organisms,modifications], function(err, rows) {
        let sql=`SELECT * FROM 
        (  HTE_PMID as m left join HTE as a on a.PMID=m.PMID left join HTE_anno as b on b.From=a.ProteinID left join HTE_GenID as c on c.From=b.From
        )`;
        let whereClause = `WHERE ${connection.escapeId(field1)} = ? ${operator === 'and' ? 'AND' : 'OR'} ${connection.escapeId(field2)} = ?`;
        if(organisms){
          whereClause = whereClause + `AND a.Organism = '${organisms}' `;
        }
        if(modifications){
          whereClause = whereClause + `AND a.Modification = '${modifications}'`;
        }
        // let addClause = `AND Organism = ${organisms} AND Modification = ${modifications}`
        // if (operator === 'and') {  
        //   whereClause = `WHERE ${connection.escapeId(field1)} = ? AND ${connection.escapeId(field2)} = ?`;  
        // } else if (operator === 'or') {  
        //   whereClause = `WHERE ${connection.escapeId(field1)} = ? OR ${connection.escapeId(field2)} = ?`;  
        // } 
        sql += whereClause; 
        console.log(sql, '--------sql查询语句');
        connection.query(sql , [name1, name2], function(err, rows) {
          if (err) {
            console.log(err);
          } else {
            console.log('数据库查询成功/Accsearch', rows);
            res.send({list:rows,name:name1, organisms,modifications});
            
          }
        // DB.end();
        connection.release();

      })
  })
})



// download excels
router.post('/download', function(req, res, next) {
  console.log(req.body, '----')
  let name = req.body?.sqlName;
  // let DBresult;
  // DB.connect();
  function sendMsg(rows){
    console.log('rows----函数的触发时机预期在数据库连接释放后');
    let data = [];
    //excel表头部分
    if(name=='HTE'){
      data.push([
        'UniProt_ID',
        'Gene_Name',
        'position',
        'Peptide',
        'Sequence',
        'Modification',
        'probability',
        'Sample',
        'Log2ratio',
        'p_value',
        'species',
        'PMID',
        'Stress'
  
      ]);
    }else {
      data.push([
        'Protein_ID',
        'Gene_name'	,
        'Position',
        'Raw_peptide'	,
        'Sequence',	
        'Modification'	,
        'Sample'	,
        'Condition'	,
        'Log2ratio'	,
        'P_value',	
        'Organism'	,
        'PMID'	,
        'stress',	
        'Resource'	,
        'Sample',
        'function'	, 
        'kinase',	
        'method',	
        'Condition_detail'
  
      ]);
    }
  
    for(let i =0; i < rows.length; i++) {
      let arr = [];
      let value = rows[i];
      for(let j in value) {
        arr.push(value[j]);
      }
      data.push(arr);
    } 
    // console.log(data, '----data');
    var buffer = xlsx.build([{name: "sheet1", data: data}]);
    // 直接导出excle文件
    // fs.writeFileSync('./test.xlsx', buffer, {'flag': 'w'});
    // 设置响应头
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    // res.setHeader('Content-Disposition', 'attachment; filename=test.xlsx');
    // 将 Excel 文件的二进制流数据返回给客户端
    console.log('发送相关数据----------');
    res.end(buffer, 'binary');
  }

  DBPool.getConnection((err,connection) => {
      if (err) {
        throw err; //不进行数据库连接
      }
      connection.query(`SELECT * FROM ${name}`, function(err, rows) {
      if (err) {
        console.log(err);
      } else {
        console.log('数据库查询成功');
        connection.release();
        console.log('数据库释放成功-------------release');

        sendMsg(rows);  
      }
      // DB.end();
     
    })
  })

 

});


module.exports = router;


// select * from (HTE_PMID inner join HTE on HTE_PMID.PMID = HTE.PMID) as a where a.Searchdatabase = 'Phytozome version 8.0';
