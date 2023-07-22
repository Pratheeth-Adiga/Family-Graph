const Neo4jDriver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'FamilyGraph')
);
const session = Neo4jDriver.session();

function draw() {
  const data = {
    nodes: [],
    edges: [],
  };

const relationQuery = 'MATCH (p1:Person)-[r:Relation]->(p2:Person) RETURN p1, r, p2';
const standaloneQuery = 'MATCH (p:Person) WHERE NOT (p)-[:Relation]-() RETURN p';

session.run(relationQuery)
  .then((result) => {
    result.records.forEach((record) => {
      const person1 = record.get('p1').properties;
      const person2 = record.get('p2').properties;
      const relation = record.get('r').properties;

      let person = { id: person1.uuid, label: person1.name };
      if (!data.nodes.some(node => node.id === person.id)) {
        data.nodes.push({ 
          id: person1.uuid, 
          label: person1.name,
        });
      }

      person = { id: person2.uuid, label: person2.name };
      if (!data.nodes.some(node => node.id === person.id)) {  
        data.nodes.push({ 
          id: person2.uuid, 
          label: person2.name, 
          title: "",
        });
      }
      
      data.edges.push({
        id: relation.uuid,
        from: person1.uuid,
        to: person2.uuid,
        label: relation.name,
        arrows: 'to',
      });
    });

  return session.run(standaloneQuery);
  })
  .then((result) => {
    result.records.forEach((record) => {
      const person = record.get('p').properties;
      data.nodes.push({ id: person.uuid, label: person.name});
    });

    options = {
      nodes: {
        borderWidth: 1,
        shadow: true,
      },
      edges: {
        arrows:{
          to:{
            enabled: true,
          }
        },
        width: 1,
        shadow: true,
        length: 30,
      },
      layout:{
        // hierarchical:{
        //   enabled: true,
        // },
        randomSeed: 7,
      },
      interaction:{
        hover: true,
        keyboard:{
          enabled: true,
        },
        navigationButtons: true,
      },
      physics:{
        // solver: "hierarchicalRepulsion",
        enabled: false,
      },

      manipulation: {
        addNode: function addNodeFun(data, callback) {
          getNodeData().then(function (nodeList) {
            data.label = nodeList[0];
            const tx = session.beginTransaction();
            tx.run(
              'MERGE (n:Person {name: $name, birthYear: $birthYear, location: $location, phone: $phone, description: $desc, gender: $gender, alive: $alive})',
              {
                name: nodeList[0],
                birthYear: nodeList[1],
                location: nodeList[2],
                phone: nodeList[3],
                desc: nodeList[4],
                gender: nodeList[5],
                alive: nodeList[6]
              }
            ).then(function () {
              callback(data);
              tx.commit();
              // window.location.reload();
            }).catch(function (error) {
              console.error(error);
              tx.rollback();
            }).then(function () {
              tx.close();
            });
          });
        },
        
        addEdge: function (edgeData, callback) {
          getEdgeData().then(function (relation) {
            edgeData.label = relation;
            const tx = session.beginTransaction();
            tx.run(
              'MATCH (p:Person) WHERE p.uuid = $from MATCH (n:Person) WHERE n.uuid = $to CREATE (p) - [:Relation {name:$relation}] -> (n);',
              {from: edgeData.from, to: edgeData.to, relation: relation}
            ).then(function () {
              callback(edgeData);
              tx.commit();
              // window.location.reload();
            }).catch(function (error) {
              console.error(error);
              tx.rollback();
            }).then(function () {
              tx.close();
            });
            console.log(typeof (edgeData.from) + "\n" + typeof (relation) + "\n" + edgeData.to);
          });
        },

        editNode: function (data, callback) {
          getnode(data).then( function(nodedata){
            setNodeData(nodedata).then(function (nodeList){
            data.label = nodeList[0];
            const tx = session.beginTransaction();
            tx.run(
              'MATCH (n WHERE n.uuid = $uuid) SET n.name = $name, n.birthYear = $birthYear, n.location = $location, n.phone = $phone, n.description = $desc, n.gender = $gender, n.alive = $alive;',
              {
                uuid: nodedata.uuid,
                name: nodeList[0],
                birthYear: nodeList[1], 
                location: nodeList[2],
                phone: nodeList[3],
                desc: nodeList[4],
                gender: nodeList[5],
                alive: nodeList[6]
              }
            ).then(function () {
              callback(data);
              tx.commit();
              window.location.reload();
            }).catch(function (error) {
              console.error(error);
              tx.rollback();
            }).then(function () {
              tx.close();
            });
              })
            }
          )
          callback(data);
        },

        editEdge: {
          editWithoutDrag: function (data, callback) {
              setEdgeData(data).then(function(relation){
                data.label = relation;
                const tx = session.beginTransaction();
                tx.run(
                  'MATCH () - [r:Relation WHERE r.uuid = $id] - () SET r.name = $name',
                  {id:data.id, name: relation}
                ).then(function () {
                  callback(data);
                  tx.commit();
                  window.location.reload();
                }).catch(function (error) {
                  console.error(error);
                  tx.rollback();
                }).then(function () {
                  tx.close();
                });
              })
            callback(data);
          },
        },

        deleteNode: function(nodeData,callback){
          DeleteNodeData().then(function(bool){
            if(bool){
              const tx = session.beginTransaction();
                tx.run(
                  'MATCH (n WHERE n.uuid = $id) DETACH DELETE n',
                  {id: nodeData.nodes[0]}
                ).then(function () {
                  callback(data);
                  tx.commit();
                  window.location.reload();
                }).catch(function (error) {
                  console.error(error);
                  tx.rollback();
                }).then(function () {
                  tx.close();
                });
            }
          })
          callback(nodeData);
        },

        deleteEdge: function(edgeData,callback){
          DeleteEdgeData().then(function(bool){
            if(bool){
              const tx = session.beginTransaction();
                tx.run(
                  'MATCH (:Person) - [r:Relation WHERE r.uuid = $id] -> (:Person) DELETE r',
                  {id: edgeData.edges[0]}
                ).then(function () {
                  callback(edgeData);
                  tx.commit();
                  window.location.reload();
                }).catch(function (error) {
                  console.error(error);
                  tx.rollback();
                }).then(function () {
                  tx.close();
                });
            }
          }) 
          callback(edgeData);         
        },
      },
    };

  const container = document.getElementById("mynetwork");

  network = new vis.Network(container, data, options);
  })
}

function getNodeData() {
  return new Promise(function (resolve, reject) {
    let modal = new bootstrap.Modal(document.getElementById("node-modal"));
    modal.toggle();
    document.getElementById("save-node").onclick = function () {
      let name = document.getElementById("node-name").value;
      let birthYear = document.getElementById("node-birth-year").value;
      let location = document.getElementById("node-location").value;
      let phone = document.getElementById("node-phone").value;
      let desc = document.getElementById("node-description").value;
      let gender;
        if(document.getElementById("node-gender-f").checked)
          gender = "Female";
        else
          gender = "Male";
      let alive;
        if(document.getElementById("node-alive-y").checked)
          alive = "Yes";
        else
          alive = "No";
      let nodeList = [name,birthYear,location,phone,desc,gender,alive];
      modal.toggle();
      resolve(nodeList);
      reject(console.error());
    };
  });
}

function getEdgeData() {
  return new Promise(function (resolve, reject) {
    let modal = new bootstrap.Modal(document.getElementById("edge-modal"));
    modal.toggle();
    let a = ["Father","Mother","Brother","Sister","Son","Daughter","Husband","Wife"];
    document.getElementById("save-edge").onclick = function () {
      let index = document.getElementById("edge-select").value;
      modal.toggle();
      resolve(a[index]);
      reject(console.error());
    };
  });
}

function setNodeData(data) {
  return new Promise(function (resolve, reject) {
    let modal = new bootstrap.Modal(document.getElementById("node-modal"));
    document.getElementById("node-name").value = data.name;
    document.getElementById("node-birth-year").value = data.birthYear;
    document.getElementById("node-location").value = data.location;
    document.getElementById("node-phone").value = data.phone;
    document.getElementById("node-description").value = data.desc;
    if(data.gender == "Female")
        document.getElementById("node-gender-f").checked = true;
    if(data.alive == "No")
        document.getElementById("node-alive-n").checked = true;
    modal.toggle();
    document.getElementById("save-node").onclick = function () {
      let name = document.getElementById("node-name").value;
      let birthYear = document.getElementById("node-birth-year").value;
      let location = document.getElementById("node-location").value;
      let phone = document.getElementById("node-phone").value;
      let desc = document.getElementById("node-description").value;
      let gender;
        if(document.getElementById("node-gender-f").checked)
          gender = "Female";
        else
          gender = "Male";
      let alive;
        if(document.getElementById("node-alive-y").checked)
          alive = "Yes";
        else
          alive = "No";
      let nodeList = [name,birthYear,location,phone,desc,gender,alive];
      modal.toggle();
      resolve(nodeList);
      reject(console.error());
    };
  });
}

function setEdgeData(data){
  return new Promise(function (resolve, reject) {
    let modal = new bootstrap.Modal(document.getElementById("edge-modal"));
    let a = ["Father","Mother","Brother","Sister","Son","Daughter","Husband","Wife"];
    for(let i = 0; i < a.length; i++){
      if(data.name == a[i])
        document.getElementById("edge-select").value = i;
    }
    modal.toggle();
    document.getElementById("save-edge").onclick = function () {
      let index = document.getElementById("edge-select").value;
      modal.toggle();
      resolve(a[index]);
      reject(console.error());
    };
  });
}

function DeleteNodeData(){
  return new Promise(function (resolve, reject) {
    let modal = new bootstrap.Modal(document.getElementById("delete-node-modal"));
    modal.toggle();
    document.getElementById("delete-node").onclick = function () {
      modal.toggle();
      resolve(true);
      reject(console.error());
    };
  });
}

function DeleteEdgeData(){
  return new Promise(function (resolve, reject) {
    let modal = new bootstrap.Modal(document.getElementById("delete-edge-modal"));
    modal.toggle();
    document.getElementById("delete-edge").onclick = function () {
      modal.toggle();
      resolve(true);
      reject(console.error());
    };
  });
}

function getnode(data){
  return new Promise((resolve, reject) => {
    let node = [];
    session.run('MATCH (n) WHERE n.uuid = $uuid RETURN n;', {uuid: data.id})
    .then((result) => {
      result.records.forEach((record) => {
        node.push(record.get('n').properties);
      });
      resolve(node[0]);
    })
    .catch((error)=>{
      console.error(error);
      reject(error);
    });
  });
}

draw();
