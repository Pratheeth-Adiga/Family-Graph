## Family-Graph
This software is helps to create a graphical sturcture of a family which don't usually run by the rules of a family tree. This helps in visulazing the relations and to store and analyze the data for any other application.

---

## Tech-Stack
- Neo4j Database
- HTML
- Javascript

---

### Pre-requisites
- Neo4j Desktop

---
### Instructions to Run

- Enable apoc.trigger.enabled = true and apoc.uuid.enable = true in $NEO4J_HOME/conf/apoc.conf if the file doesn't exist create one.
- Install APOC plugins on the desired databases in Neo4j Desktop.
- Run the following Queries in Neo4j Browser
  - CALL apoc.trigger.add('assign-uuid', 'MATCH (node:Person) WHERE node.uuid IS NULL SET node.uuid = apoc.create.uuid()', {phase: "before"})
  - CALL apoc.trigger.add('rel-assign-uuid', 'MATCH () - [r:Relation] -> () WHERE r.uuid IS NULL SET r.uuid = apoc.create.uuid()', {phase: "before"})
- Change the password to the one given to the database and browser url to what the neo4j browser opens on (by default it is set to localhost:7687)
- Run index.html (start the database before running this).

---
### Features
- It has 3 pages first one to just see the graph, second one to edit it and third page to see the relation between two nodes.
- You can add, edit and delete edges and nodes in edit page.
- You get the information about the node by hovering on it.
- By default node collects name, date of birth, location, phone number, gender as inputs which can be modified in edit.js.
- Edge by default only collects only relationship which can also be changeed in edit.js.
- You can see the relation between two nodes in the third page.

---

#### Thank You
