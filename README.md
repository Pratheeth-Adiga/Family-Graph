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

- Enable apoc.trigger.enabled=true in $NEO4J_HOME/conf/apoc.conf first.
- If there is no apoc.conf file create one 
- Run the following Queries in Neo4j Browser
  - CALL apoc.trigger.add('assign-uuid', 'MATCH (node:Person) WHERE node.uuid IS NULL SET node.uuid = apoc.create.uuid()', {phase: "before"})
  - CALL apoc.trigger.add('rel-assign-uuid', 'MATCH () - [r:%] -> () WHERE r.uuid IS NULL SET r.uuid = apoc.create.uuid()', {phase: "before"})
- Run edit.html

---

#### Thank You
