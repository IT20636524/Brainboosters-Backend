const bcrypt = require("bcrypt");
const { db } = require("../config/firebase");
const crypto = require("crypto");
const firebase = require('firebase-admin')
async function hashPassword(password) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}

function generateChildId() {
  const randomBytes = crypto.randomBytes(12); // Generate 12 random bytes
  const childId = randomBytes.toString("hex").slice(0, 24); // Convert to hex string and truncate to 24 characters
  return `c${childId}`;
}

const createChild = async (req, res) => {
  const { name, age, email, snapIVRecord } = req.body;

  if (!name || !age || !email || !snapIVRecord) {
    return res
      .status(400)
      .send("Missing required fields: name, age, email, snapIVRecord");
  }

  if (
    !Array.isArray(snapIVRecord) ||
    !snapIVRecord.every((element) => typeof element === "number")
  ) {
    return res
      .status(400)
      .send("Invalid snapIVRecord: must be an array of numbers");
  }

  try {
    const childId = generateChildId();
    const childRef = db.collection("children").doc();
    const parentId = req.params.parentId;
    const childData = {
      childId,
      name,
      age,
      email,
      snapIVRecord,
      parentId
    };
    await childRef.set(childData);
    

    if (parentId) {
      const querySnapshot = await db
        .collection("parents")
        .where("parentId", "==", parentId)
        .get();

      if (!querySnapshot.empty) {
        const parentRef = querySnapshot.docs[0].ref; // Get reference to the first document

        // Now you can use parentRef for update
        await parentRef.update({
          children: firebase.firestore.FieldValue.arrayUnion(childRef),
        });
        console.log("Parent document updated");
      } else {
        console.warn("No parent document found with parentId", parentId);
      }
    }
    res.status(201).send("Child created successfully");
  } catch (error) {
    console.error("Error creating child:", error);
    res.status(500).send("Error creating child");
  }
};

const getAllChildren = async (req, res) => {
  try {
    const childrenSnapshot = await db.collection("children").get();
    const children = childrenSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(children);
  } catch (error) {
    console.error("Error getting all children:", error);
    res.status(500).send("Error getting children");
  }
};

const getOneChild = async (req, res) => {
  const childId = req.params.childId;

  if (!childId) {
    return res.status(400).send("Missing childId parameter");
  }

  try {
    const querySnapshot = await db
      .collection("children")
      .where("childId", "==", childId)
      .get();

    if (!querySnapshot.empty) {
      const childDoc = querySnapshot.docs[0];
      const childData = {
        id: childDoc.id, // Document ID
        ...childDoc.data(),
      };
      return res.status(200).json(childData);
    } else {
      console.warn("No child document found with childId", childId);
      return res.status(404).send("Child not found");
    }
  } catch (error) {
    console.error("Error getting child:", error);
    res.status(500).send("Error getting child");
  }
};

const updateChild = async (req, res) => {
  const childId = req.params.childId;
  const { name, age, email, snapIVRecord } = req.body; // Assuming these are the updatable fields

  if (!childId) {
    return res.status(400).send("Missing childId parameter");
  }

  try {
    const querySnapshot = await db
      .collection("children")
      .where("childId", "==", childId)
      .get();

    if (!querySnapshot.empty) {
      const childRef = querySnapshot.docs[0].ref;
      const updateData = {
        name, // Update only provided fields
        age,
        email,
        snapIVRecord,
      };
      await childRef.update(updateData);
      res.status(200).send("Child updated successfully");
    } else {
      console.warn("No child document found with childId", childId);
      return res.status(404).send("Child not found");
    }
  } catch (error) {
    console.error("Error updating child:", error);
    res.status(500).send("Error updating child");
  }
};

const deleteChild = async (req, res) => {
  const childId = req.params.childId;

  if (!childId) {
    return res.status(400).send("Missing childId parameter");
  }

  try {
    await db.runTransaction(async (transaction) => {
      const childQuerySnapshot = await transaction.get(
        db.collection("children").where("childId", "==", childId)
      );

      if (!childQuerySnapshot.empty) {
        const childDoc = childQuerySnapshot.docs[0];
        const childData = childDoc.data();
        const childRef = childDoc.ref;

        const parentId = childData.parentId; 

        if (parentId) {
          const parentQuery = db
            .collection("parents")
            .where("parentId", "==", parentId);
          const parentSnapshot = await transaction.get(parentQuery);

          if (!parentSnapshot.empty) {
            const parentDoc = parentSnapshot.docs[0];
            const parentData = parentDoc.data();
            const parentRef = parentDoc.ref;
            // console.log("hiiiiiiiiii", childRef.path);

            const childIndex = parentDoc
              .data()
              .children.findIndex((ref) => ref.isEqual(childRef));

            // console.log("childIndex:", childIndex); 
            // console.log("parentData.children:", parentData.children);
            if (childIndex !== -1) {
              parentData.children.splice(childIndex, 1);
              await transaction.update(parentRef, {
                children: parentData.children,
              }); // Update parent document
            } else {
              console.warn(
                "Child reference not found in parent document:",
                childId
              );
            }
          } else {
            console.warn("Parent document not found with parentId:", parentId);
          }
        } else {
          console.warn("Missing parentId field in child document:", childId);
        }

        await transaction.delete(childRef);
        res.status(200).send("Child deleted successfully");
      } else {
        console.warn("No child document found with childId", childId);
        return res.status(404).send("Child not found");
      }
    });
  } catch (error) {
    console.error("Error deleting child:", error);
    res.status(500).send("Error deleting child");
  }
};


module.exports = {
  createChild,
  getAllChildren,
  getOneChild,
  updateChild,
  deleteChild
};
