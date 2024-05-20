const { db } = require("../config/firebase");
const crypto = require("crypto");

function generateParentId() {
  const randomBytes = crypto.randomBytes(12); // Generate 12 random bytes
  const parentId = randomBytes.toString("hex").slice(0, 24); // Convert to hex string and truncate to 24 characters
  return `p${parentId}`;
}

const createParent = async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).send("Missing required fields: name, email");
  }

  try {
    const parentId = generateParentId();
    const parentRef = db.collection("parents").doc();
    await parentRef.set({
      parentId,
      name,
      email,
      children: [],
    });
    res.status(201).send("Parent created successfully");
  } catch (error) {
    console.error("Error creating parent:", error);
    res.status(500).send("Error creating parent");
  }
};

const getOneParent = async (req, res) => {
  const parentId = req.params.parentId;

  if (!parentId) {
    return res.status(400).send("Missing parentId parameter");
  }

  try {
    const querySnapshot = await db
      .collection("parents")
      .where("parentId", "==", parentId)
      .get();

    if (!querySnapshot.empty) {
      const parentDoc = querySnapshot.docs[0];
      const parentData = {
        id: parentDoc.id, // Document ID
        ...parentDoc.data(),
      };

      const childData = (await Promise.all(parentData.children.map(async (child) => {
        return await db
          .collection("children")
          .doc(child._path.segments[1])
          .get();
      }))).map((snapShot) => snapShot.data())
      console.log(childData)
      res.status(200).json(parentData);
    } else {
      console.warn("No parent document found with parentId", parentId);
      return res.status(404).send("Parent not found");
    }
  } catch (error) {
    console.error("Error getting parent:", error);
    res.status(500).send("Error getting parent");
  }
};

const getParentByEmail = async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).send("Missing email parameter");
  }

  try {
    const querySnapshot = await db
      .collection("parents")
      .where("email", "==", email)
      .get();

    if (!querySnapshot.empty) {
      const parentDoc = querySnapshot.docs[0];
      const parentData = {
        id: parentDoc.id, // Document ID
        ...parentDoc.data(),
      };
      res.status(200).json(parentData);
    } else {
      console.warn("No parent document found with email", email);
      return res.status(404).send("Parent not found");
    }
  } catch (error) {
    console.error("Error getting parent by email:", error);
    res.status(500).send("Error getting parent by email");
  }
};

module.exports = {
  createParent,
  getOneParent,
  getParentByEmail,
};
