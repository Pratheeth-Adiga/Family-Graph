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
          // title: "",
          arrows: 'to',
        });
      });
  
    return session.run(standaloneQuery);
    })
    .then((result) => {
      result.records.forEach((record) => {
        const person = record.get('p').properties;
        data.nodes.push({ 
          id: person.uuid, 
          label: person.name,
          title: getTitle(person),
        });
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
        smooth:{
          forceDirection: "none",
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
        barnesHut:{
          // springConstant: 0,
        },
      },
      };
  
    const container = document.getElementById("mynetworkindex");
  
    network = new vis.Network(container, data, options);
    session.close();
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
  