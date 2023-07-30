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
            title: getTitle(person1),
          });
        }
  
        person = { id: person2.uuid, label: person2.name };
        if (!data.nodes.some(node => node.id === person.id)) {  
          data.nodes.push({ 
            id: person2.uuid, 
            label: person2.name, 
            title: getTitle(person2),
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
        manipulation:{
            enabled: false,
        },
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
          length: 300,
        },
        layout:{
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
          enabled: true,
        },
      };
  
    const container = document.getElementById("mynetworkindex");
    const network = new vis.Network(container, data, options);

    let fromnode = undefined, tonode = undefined;

    document.getElementById("from-button").onclick = function(){
      detectClickedNode().then(
        function(node){
          fromnode = node;
          console.log(node);
          document.getElementById("from-text").value = node.label;
        }
      );
    }

    document.getElementById("to-button").onclick = function(){
      detectClickedNode().then(
        function(node){
          tonode = node;
          console.log(node);
          document.getElementById("to-text").value = node.label;
        }
      );
    }

    let arr = [];

    document.getElementById("swap").onclick = function(){
      [fromnode,tonode] = [tonode,fromnode];
      console.log(fromnode);
      document.getElementById("from-text").value = fromnode.label;
      document.getElementById("to-text").value = tonode.label;
    }

    document.getElementById("evaluate").onclick = async function () {
      if (fromnode === undefined || tonode === undefined)
        console.log("undefined");
      else {
        try {
          const result = await executer(fromnode, tonode);
          result.records.forEach((record) => {
            const a = record.get('p');
            b = a.segments;
            for(let i = 0; i < b.length; i++){
              arr.push(a.segments[i].relationship.properties.name);
            }
            let string = "";
            for(let i = 0; i < arr.length; i++){
              if(i == arr.length - 1)
                string = string + arr[i];
              else
                string = string + arr[i] + " -> ";
            }
            document.getElementById("Relation").value = string;
            arr = [];
            console.log(arr);
          })
        } catch (error) {
          console.error(error);
        }
      }
    }

    let detectingClick = false;
    function detectClickedNode() {
      return new Promise(function (resolve, reject) {
        if (!detectingClick) {
          detectingClick = true;
          network.once("click", function (params) {
            const clickedNode = data.nodes.find(node => node.id === params.nodes[0]);
            if (clickedNode) {
              resolve(clickedNode);
            }
            reject(console.error());
            detectingClick = false;
          });
        }
      })
    }
  })
}
  
draw();

function getTitle(node){
    let content = `
        <ul>
        <li>Name: ${node.name}</li>
        <li>Born: ${node.birthYear} </li>
        <li>Location: ${node.location}</li>
        <li>Phone: ${node.phone}</li>
        <li>Gender: ${node.gender}</li>
        <li>Description: ${node.desc}</li>
        <li>Alive: ${node.alive}</li>
        </ul>` ;
    const element = document.createElement("div");
    element.innerHTML = content;
    return element;
}

function executer(fromnode, tonode) {
  return new Promise(function (resolve, reject) {
    const tx = session.beginTransaction();
    tx.run(
      'MATCH p = shortestPath((n:Person {uuid: $from}) - [:Relation *1..20] -> (m:Person {uuid: $to})) RETURN p;',
      { from: fromnode.id, to: tonode.id }
    )
      .then((result) => {
        resolve(result);
      })
      .catch(function (error) {
        reject(error);
      })
      .then(function () {
        tx.close();
      });
  });
}
  